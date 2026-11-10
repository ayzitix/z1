/*---------------------------------------------------------------------------------------------
 *  Copyright (c) z1. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import './media/z1Landing.css';

import { $, addDisposableListener, append, clearNode } from '../../../../base/browser/dom.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { splitRecentLabel } from '../../../../base/common/labels.js';
import { localize } from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { ILabelService, Verbosity } from '../../../../platform/label/common/label.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IWorkspaceContextService, WorkbenchState } from '../../../../platform/workspace/common/workspace.js';
import { IRecentFolder, IRecentWorkspace, IWorkspacesService, isRecentFolder } from '../../../../platform/workspaces/common/workspaces.js';
import { IWindowOpenable } from '../../../../platform/window/common/window.js';
import { IEditorGroup } from '../../../services/editor/common/editorGroupsService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { Z1Watermark } from './z1Watermark.js';

const MAX_RECENT_PROJECTS = 5;

/**
 * The z1 landing screen. It is rendered directly inside the empty editor group
 * (not as an editor tab) and only while the window has no folder/workspace and
 * the group has no editors. The moment an editor or a folder appears, the
 * screen is simply no longer rendered, so there is nothing to "close" after
 * an action.
 */
export class Z1LandingScreen extends Disposable {

	private readonly element: HTMLElement;
	private recentContainer!: HTMLElement;
	private recentRefreshId = 0;
	private readonly recentDisposables = this._register(new DisposableStore());

	constructor(
		container: HTMLElement,
		private readonly group: IEditorGroup,
		@IWorkspaceContextService private readonly contextService: IWorkspaceContextService,
		@ICommandService private readonly commandService: ICommandService,
		@IFileDialogService private readonly fileDialogService: IFileDialogService,
		@IQuickInputService private readonly quickInputService: IQuickInputService,
		@INotificationService private readonly notificationService: INotificationService,
		@IHostService private readonly hostService: IHostService,
		@IWorkspacesService private readonly workspacesService: IWorkspacesService,
		@ILabelService private readonly labelService: ILabelService,
	) {
		super();

		this.element = append(container, $('.z1-landing'));
		this.element.style.display = 'none';

		this.build();
		this.registerListeners();
		this.render();

		void this.refreshRecentProjects();
	}

	private build(): void {
		const content = append(this.element, $('.z1-landing-content'));

		// Brand: the animated z1 eye followed by the wordmark.
		const brand = append(content, $('.z1-landing-brand'));
		const logo = this._register(new Z1Watermark());
		append(brand, logo.element);
		append(brand, $('span.z1-landing-name', {}, 'z1'));

		// Actions.
		const grid = append(content, $('.z1-landing-grid'));
		this.addCard(grid, 'folder', localize('z1.landing.openProject', "Open project"), () => void this.openProject(), 'z1-landing-primary');
		this.addCard(grid, 'repo', localize('z1.landing.cloneRepo', "Clone repo"), () => void this.commandService.executeCommand('git.clone'));
		this.addCard(grid, 'terminal', localize('z1.landing.connectSsh', "Connect via SSH"), () => void this.connectViaSSH());
		this.addCard(grid, 'info', localize('z1.landing.about', "About z1"), () => void this.commandService.executeCommand('workbench.action.showAboutDialog'));

		// Recent projects (filled asynchronously).
		this.recentContainer = append(content, $('.z1-landing-recent'));
		this.recentContainer.style.display = 'none';
	}

	private addCard(grid: HTMLElement, icon: string, label: string, action: () => void, className?: string): void {
		const card = append(grid, $('button.z1-landing-card', { type: 'button' })) as HTMLButtonElement;
		card.setAttribute('aria-label', label);
		if (className) {
			card.classList.add(className);
		}

		append(card, $('span.codicon.codicon-' + icon));
		append(card, $('span.z1-landing-card-label', {}, label));

		this._register(addDisposableListener(card, 'click', () => action()));
	}

	private registerListeners(): void {
		this._register(this.contextService.onDidChangeWorkbenchState(() => {
			this.render();
			void this.refreshRecentProjects();
		}));

		this._register(this.group.onDidModelChange(() => this.render()));

		this._register(this.workspacesService.onDidChangeRecentlyOpened(() => void this.refreshRecentProjects()));
	}

	private render(): void {
		const visible = this.contextService.getWorkbenchState() === WorkbenchState.EMPTY && this.group.isEmpty;

		this.element.style.display = visible ? 'flex' : 'none';
		this.element.parentElement?.classList.toggle('z1-landing-active', visible);
	}

	private async openProject(): Promise<void> {
		const folder = (await this.fileDialogService.showOpenDialog({
			openLabel: localize('z1.landing.open', "Open"),
			title: localize('z1.landing.openTitle', "Open Project"),
			canSelectFiles: false,
			canSelectFolders: true,
			canSelectMany: false,
			defaultUri: await this.fileDialogService.defaultFolderPath()
		}))?.[0];

		if (!folder) {
			return; // cancelled: the landing stays visible
		}

		await this.hostService.openWindow([{ folderUri: folder }], { forceNewWindow: false });
	}

	private async connectViaSSH(): Promise<void> {
		const host = await this.quickInputService.input({
			prompt: localize('z1.landing.connectSsh.prompt', "Connect to an SSH host"),
			placeHolder: localize('z1.landing.connectSsh.placeholder', "user@host")
		});

		if (!host) {
			return;
		}

		try {
			await this.commandService.executeCommand('workbench.action.terminal.new');
			await this.commandService.executeCommand('workbench.action.terminal.sendSequence', { text: `ssh ${host}\n` });
		} catch (error) {
			this.notificationService.warn(localize('z1.landing.connectSsh.failed', "Could not start SSH session: {0}", String(error)));
		}
	}

	private async refreshRecentProjects(): Promise<void> {
		const refreshId = ++this.recentRefreshId;

		let workspaces: Array<IRecentFolder | IRecentWorkspace>;
		try {
			workspaces = (await this.workspacesService.getRecentlyOpened()).workspaces;
		} catch {
			return;
		}

		// A newer refresh (or a disposed screen) won the race.
		if (refreshId !== this.recentRefreshId) {
			return;
		}

		this.recentDisposables.clear();
		clearNode(this.recentContainer);
		this.recentContainer.style.display = 'none';

		if (!workspaces.length) {
			return;
		}

		this.recentContainer.style.display = 'flex';

		const header = append(this.recentContainer, $('.z1-landing-recent-header'));
		append(header, $('span', {}, localize('z1.landing.recent', "Recent projects")));

		if (workspaces.length > MAX_RECENT_PROJECTS) {
			const viewAll = append(header, $('button.z1-landing-recent-viewall', { type: 'button' }, localize('z1.landing.viewAll', "View all ({0})", workspaces.length)));
			this.recentDisposables.add(addDisposableListener(viewAll, 'click', () => void this.commandService.executeCommand('workbench.action.openRecent')));
		}

		const list = append(this.recentContainer, $('.z1-landing-recent-list'));
		for (const recent of workspaces.slice(0, MAX_RECENT_PROJECTS)) {
			this.addRecentProject(list, recent);
		}
	}

	private addRecentProject(list: HTMLElement, recent: IRecentFolder | IRecentWorkspace): void {
		const fullLabel = recent.label ?? (
			isRecentFolder(recent)
				? this.labelService.getWorkspaceLabel(recent.folderUri, { verbose: Verbosity.LONG })
				: this.labelService.getWorkspaceLabel(recent.workspace, { verbose: Verbosity.LONG })
		);
		const { name, parentPath } = splitRecentLabel(fullLabel);

		const item = append(list, $('button.z1-landing-recent-item', { type: 'button', title: fullLabel })) as HTMLButtonElement;
		append(item, $('span.z1-landing-recent-name', {}, name));
		append(item, $('span.z1-landing-recent-path', {}, parentPath));

		this.recentDisposables.add(addDisposableListener(item, 'click', (event: MouseEvent) => {
			const toOpen: IWindowOpenable = isRecentFolder(recent)
				? { folderUri: recent.folderUri }
				: { workspaceUri: recent.workspace.configPath };

			void this.hostService.openWindow([toOpen], {
				forceNewWindow: event.ctrlKey || event.metaKey,
				remoteAuthority: recent.remoteAuthority || null
			});
		}));
	}
}
