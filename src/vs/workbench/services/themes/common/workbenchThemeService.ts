/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { refineServiceDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { Event } from '../../../../base/common/event.js';
import { Color } from '../../../../base/common/color.js';
import { IColorTheme, IThemeService, IFileIconTheme, IProductIconTheme } from '../../../../platform/theme/common/themeService.js';
import { ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
import { isBoolean, isString } from '../../../../base/common/types.js';
import { IconContribution, IconDefinition } from '../../../../platform/theme/common/iconRegistry.js';
import { ColorScheme, ThemeTypeSelector } from '../../../../platform/theme/common/theme.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';

export const IWorkbenchThemeService = refineServiceDecorator<IThemeService, IWorkbenchThemeService>(IThemeService);

export const THEME_SCOPE_OPEN_PAREN = '[';
export const THEME_SCOPE_CLOSE_PAREN = ']';
export const THEME_SCOPE_WILDCARD = '*';

export const themeScopeRegex = /\[(.+?)\]/g;

export enum ThemeSettings {
	COLOR_THEME = 'workbench.colorTheme',
	FILE_ICON_THEME = 'workbench.iconTheme',
	PRODUCT_ICON_THEME = 'workbench.productIconTheme',
	COLOR_CUSTOMIZATIONS = 'workbench.colorCustomizations',
	TOKEN_COLOR_CUSTOMIZATIONS = 'editor.tokenColorCustomizations',
	SEMANTIC_TOKEN_COLOR_CUSTOMIZATIONS = 'editor.semanticTokenColorCustomizations',

	PREFERRED_DARK_THEME = 'workbench.preferredDarkColorTheme',
	PREFERRED_LIGHT_THEME = 'workbench.preferredLightColorTheme',
	PREFERRED_HC_DARK_THEME = 'workbench.preferredHighContrastColorTheme', /* id kept for compatibility reasons */
	PREFERRED_HC_LIGHT_THEME = 'workbench.preferredHighContrastLightColorTheme',
	DETECT_COLOR_SCHEME = 'window.autoDetectColorScheme',
	DETECT_HC = 'window.autoDetectHighContrast',

	SYSTEM_COLOR_THEME = 'window.systemColorTheme'
}

export namespace ThemeSettingDefaults {
	export const COLOR_THEME_DARK = 'z1 Default';
	export const COLOR_THEME_LIGHT = 'z1 Ocean';
	export const COLOR_THEME_HC_DARK = 'Default High Contrast';
	export const COLOR_THEME_HC_LIGHT = 'Default High Contrast Light';

	export const FILE_ICON_THEME = 'vs-seti';
	export const PRODUCT_ICON_THEME = 'Default';
}

/**
 * Migrates legacy theme settings IDs to their current equivalents.
 * Theme IDs were simplified: "Default" prefix was removed from built-in themes,
 * and "Experimental" prefix was replaced when VS Code themes became GA.
 */
export function migrateThemeSettingsId(settingsId: string): string {
	switch (settingsId) {
		case 'Default Dark Modern': return 'Dark Modern';
		case 'Default Light Modern': return 'Light Modern';
		case 'Default Dark+': return 'Dark+';
		case 'Default Light+': return 'Light+';
		case 'Experimental Dark':
		case 'VS Code Dark':
			return ThemeSettingDefaults.COLOR_THEME_DARK;
		case 'Experimental Light':
		case 'VS Code Light':
			return ThemeSettingDefaults.COLOR_THEME_LIGHT;
	}
	return settingsId;
}

export const COLOR_THEME_DARK_INITIAL_COLORS = {
	'actionBar.toggledBackground': '#383a49',
	'activityBar.activeBorder': '#FFFFFF',
	'activityBar.background': '#141414',
	'activityBar.border': '#2A2A2A',
	'activityBar.foreground': '#CCCCCC99',
	'activityBar.inactiveForeground': '#868686',
	'activityBarBadge.background': '#FFFFFF',
	'activityBarBadge.foreground': '#000000',
	'badge.background': '#FFFFFF',
	'badge.foreground': '#141414',
	'button.background': '#FFFFFF',
	'button.border': '#FFFFFF12',
	'button.foreground': '#191c22',
	'button.hoverBackground': '#E8E8E8',
	'button.secondaryBackground': '#565656',
	'button.secondaryForeground': '#ececec',
	'button.secondaryHoverBackground': '#767676',
	'chat.slashCommandBackground': '#2A2A2A66',
	'chat.slashCommandForeground': '#FFFFFF',
	'chat.editedFileForeground': '#E2C08D',
	'checkbox.background': '#313131',
	'checkbox.border': '#3C3C3C',
	'debugToolBar.background': '#1A1A1A',
	'descriptionForeground': '#9D9D9D',
	'dropdown.background': '#1a1a1a',
	'dropdown.border': '#3A3A3A',
	'dropdown.foreground': '#FFFFFF',
	'dropdown.listBackground': '#1F1F1F',
	'editor.background': '#1a1a1a',
	'editor.findMatchBackground': '#FFFFFF66',
	'editor.foreground': '#D8DEE9',
	'editor.inactiveSelectionBackground': '#40404077',
	'editor.selectionHighlightBackground': '#404040CC',
	'editorGroup.border': '#2A2A2A',
	'editorGroupHeader.tabsBackground': '#141414',
	'editorGroupHeader.tabsBorder': '#2A2A2A',
	'editorGutter.addedBackground': '#A3BE8C',
	'editorGutter.deletedBackground': '#BF616A',
	'editorGutter.modifiedBackground': '#EBCB8B',
	'editorIndentGuide.activeBackground1': '#505050',
	'editorIndentGuide.background1': '#404040B3',
	'editorLineNumber.activeForeground': '#FFFFFF',
	'editorLineNumber.foreground': '#505050',
	'editorOverviewRuler.border': '#00000000',
	'editorWidget.background': '#141414',
	'errorForeground': '#bf616a',
	'focusBorder': '#30373a',
	'foreground': '#CCCCCCdd',
	'icon.foreground': '#CCCCCC',
	'input.background': '#2A2A2A55',
	'input.border': '#3A3A3A',
	'input.foreground': '#FFFFFF',
	'input.placeholderForeground': '#FFFFFF99',
	'inputOption.activeBackground': '#FFFFFF22',
	'inputOption.activeBorder': '#FFFFFF',
	'keybindingLabel.foreground': '#CCCCCC',
	'list.activeSelectionIconForeground': '#FFF',
	'list.dropBackground': '#FFFFFF99',
	'menu.background': '#141414',
	'menu.border': '#2A2A2A',
	'menu.foreground': '#CCCCCC',
	'menu.selectionBackground': '#2A2A2A',
	'menu.separatorBackground': '#CCCCCC',
	'notificationCenterHeader.background': '#1F1F1F',
	'notificationCenterHeader.foreground': '#CCCCCC',
	'notifications.background': '#141414',
	'notifications.border': '#2A2A2A',
	'notifications.foreground': '#FFFFFF',
	'panel.background': '#141414',
	'panel.border': '#2A2A2A',
	'panelInput.border': '#2B2B2B',
	'panelTitle.activeBorder': '#FFFFFF',
	'panelTitle.activeForeground': '#FFFFFF',
	'panelTitle.inactiveForeground': '#CCCCCC99',
	'peekViewEditor.background': '#141414',
	'peekViewEditor.matchHighlightBackground': '#FFFFFF66',
	'peekViewResult.background': '#141414',
	'peekViewResult.matchHighlightBackground': '#FFFFFF66',
	'pickerGroup.border': '#2A2A2A00',
	'ports.iconRunningProcessForeground': '#A3BE8C',
	'progressBar.background': '#A3BE8C',
	'quickInput.background': '#222222',
	'quickInput.foreground': '#CCCCCC',
	'settings.dropdownBackground': '#313131',
	'settings.dropdownBorder': '#3C3C3C',
	'settings.headerForeground': '#FFFFFF',
	'settings.modifiedItemIndicator': '#BB800966',
	'sideBar.background': '#141414',
	'sideBar.border': '#2A2A2A',
	'sideBar.foreground': '#CCCCCC99',
	'sideBarSectionHeader.background': '#141414',
	'sideBarSectionHeader.border': '#2A2A2A',
	'sideBarSectionHeader.foreground': '#505050',
	'sideBarTitle.foreground': '#CCCCCC',
	'statusBar.background': '#141414',
	'statusBar.border': '#2A2A2A',
	'statusBar.debuggingBackground': '#3A3A3A',
	'statusBar.debuggingForeground': '#D8DEE9',
	'statusBar.focusBorder': '#30373a',
	'statusBar.foreground': '#cccccc82',
	'statusBar.noFolderBackground': '#141414',
	'statusBarItem.focusBorder': '#30373a',
	'statusBarItem.prominentBackground': '#2A2A2A',
	'statusBarItem.remoteBackground': '#2A2A2A',
	'statusBarItem.remoteForeground': '#FFFFFF',
	'tab.activeBackground': '#1a1a1a',
	'tab.activeBorder': '#1A1A1A',
	'tab.activeBorderTop': '#FFFFFF',
	'tab.activeForeground': '#FFFFFF',
	'tab.border': '#2A2A2A',
	'tab.hoverBackground': '#FFFFFF00',
	'tab.inactiveBackground': '#141414',
	'tab.inactiveForeground': '#505050',
	'tab.lastPinnedBorder': '#ccc3',
	'tab.selectedBackground': '#37373D',
	'tab.selectedBorderTop': '#FFFFFF',
	'tab.selectedForeground': '#FFFFFF',
	'tab.unfocusedActiveBorder': '#FFFFFF00',
	'tab.unfocusedActiveBorderTop': '#2B2B2B',
	'tab.unfocusedHoverBackground': '#2A2A2AB3',
	'terminal.foreground': '#FFFFFFcc',
	'terminal.inactiveSelectionBackground': '#3A3D41',
	'terminal.tab.activeBorder': '#FFFFFF',
	'textBlockQuote.background': '#2B2B2B',
	'textBlockQuote.border': '#616161',
	'textCodeBlock.background': '#2B2B2B',
	'textLink.activeForeground': '#FFFFFF',
	'textLink.foreground': '#FFFFFF',
	'textPreformat.background': '#3C3C3C',
	'textPreformat.foreground': '#FFFFFF',
	'textSeparator.foreground': '#FFFFFF',
	'titleBar.activeBackground': '#141414',
	'titleBar.activeForeground': '#cccccc82',
	'titleBar.border': '#2A2A2A',
	'titleBar.inactiveBackground': '#141414',
	'titleBar.inactiveForeground': '#cccccc60',
	'welcomePage.progress.foreground': '#FFFFFF',
	'welcomePage.tileBackground': '#2B2B2B',
	'widget.border': '#2A2A2A',
};

export const COLOR_THEME_LIGHT_INITIAL_COLORS = {
	'actionBar.toggledBackground': '#0000000D',
	'activityBar.activeBorder': '#000000',
	'activityBar.background': '#FFFFFF',
	'activityBar.border': '#00000000',
	'activityBar.foreground': '#7A7A7A',
	'activityBar.inactiveForeground': '#C4C4C4',
	'activityBarBadge.background': '#000000',
	'activityBarBadge.foreground': '#FFFFFF',
	'badge.background': '#000000',
	'badge.foreground': '#FFFFFF',
	'button.background': '#000000',
	'button.border': '#00000000',
	'button.foreground': '#FFFFFF',
	'button.hoverBackground': '#2A2A2A',
	'button.secondaryBackground': '#ECECEC',
	'button.secondaryForeground': '#000000',
	'button.secondaryHoverBackground': '#E0E0E0',
	'chat.slashCommandBackground': '#ADCEFF7A',
	'chat.slashCommandForeground': '#26569E',
	'chat.editedFileForeground': '#895503',
	'checkbox.background': '#FFFFFF',
	'checkbox.border': '#C4C4C4',
	'descriptionForeground': '#5A5A5A',
	'diffEditor.unchangedRegionBackground': '#f8f8f8',
	'dropdown.background': '#FFFFFF',
	'dropdown.border': '#E8E8E8',
	'dropdown.foreground': '#000000',
	'dropdown.listBackground': '#FFFFFF',
	'editor.background': '#FFFFFF',
	'editor.foreground': '#000000',
	'editor.inactiveSelectionBackground': '#0000001A',
	'editor.selectionHighlightBackground': '#00000018',
	'editorGroup.border': '#E8E8E8',
	'editorGroupHeader.tabsBackground': '#FFFFFF',
	'editorGroupHeader.tabsBorder': '#00000000',
	'editorGutter.addedBackground': '#2E7D4F',
	'editorGutter.deletedBackground': '#C0392B',
	'editorGutter.modifiedBackground': '#000000',
	'editorIndentGuide.activeBackground1': '#C4C4C4',
	'editorIndentGuide.background1': '#E8E8E8',
	'editorLineNumber.activeForeground': '#000000',
	'editorLineNumber.foreground': '#8A8A8A',
	'editorOverviewRuler.border': '#00000000',
	'editorSuggestWidget.background': '#FFFFFF',
	'editorWidget.background': '#FFFFFF',
	'errorForeground': '#C0392B',
	'focusBorder': '#000000',
	'foreground': '#000000',
	'icon.foreground': '#000000',
	'input.background': '#FFFFFF',
	'input.border': '#E8E8E8',
	'input.foreground': '#000000',
	'input.placeholderForeground': '#7E7E7E',
	'inputOption.activeBackground': '#ECECEC',
	'inputOption.activeBorder': '#000000',
	'inputOption.activeForeground': '#FFFFFF',
	'keybindingLabel.foreground': '#4E4E4E',
	'list.activeSelectionBackground': '#ECECEC',
	'list.activeSelectionForeground': '#000000',
	'list.activeSelectionIconForeground': '#000000',
	'list.focusAndSelectionOutline': '#00000000',
	'list.hoverBackground': '#F4F4F4',
	'menu.border': '#E8E8E8',
	'menu.selectionBackground': '#ECECEC',
	'menu.selectionForeground': '#000000',
	'notebook.cellBorderColor': '#E5E5E5',
	'notebook.selectedCellBackground': '#C8DDF150',
	'notificationCenterHeader.background': '#FFFFFF',
	'notificationCenterHeader.foreground': '#000000',
	'notifications.background': '#FFFFFF',
	'notifications.border': '#E8E8E8',
	'notifications.foreground': '#000000',
	'panel.background': '#FFFFFF',
	'panel.border': '#00000000',
	'panelInput.border': '#E8E8E8',
	'panelTitle.activeBorder': '#000000',
	'panelTitle.activeForeground': '#000000',
	'panelTitle.inactiveForeground': '#C4C4C4',
	'peekViewEditor.matchHighlightBackground': '#00000033',
	'peekViewResult.background': '#FFFFFF',
	'peekViewResult.matchHighlightBackground': '#00000033',
	'pickerGroup.border': '#E8E8E8',
	'pickerGroup.foreground': '#C4C4C4',
	'ports.iconRunningProcessForeground': '#369432',
	'progressBar.background': '#000000',
	'quickInput.background': '#FFFFFF',
	'quickInput.foreground': '#000000',
	'searchEditor.textInputBorder': '#E8E8E8',
	'settings.dropdownBackground': '#FFFFFF',
	'settings.dropdownBorder': '#E8E8E8',
	'settings.headerForeground': '#000000',
	'settings.modifiedItemIndicator': '#000000',
	'settings.numberInputBorder': '#E8E8E8',
	'settings.textInputBorder': '#E8E8E8',
	'sideBar.background': '#FFFFFF',
	'sideBar.border': '#00000000',
	'sideBar.foreground': '#5A5A5A',
	'sideBarSectionHeader.background': '#FFFFFF',
	'sideBarSectionHeader.border': '#E8E8E8',
	'sideBarSectionHeader.foreground': '#6E6E6E',
	'sideBarTitle.foreground': '#7E7E7E',
	'statusBar.background': '#000000',
	'statusBar.border': '#00000000',
	'statusBar.debuggingBackground': '#8A6A00',
	'statusBar.debuggingForeground': '#000000',
	'statusBar.focusBorder': '#FFFFFF',
	'statusBar.foreground': '#C4C4C4',
	'statusBar.noFolderBackground': '#000000',
	'statusBarItem.compactHoverBackground': '#FFFFFF1F',
	'statusBarItem.errorBackground': '#C0392B',
	'statusBarItem.focusBorder': '#FFFFFF',
	'statusBarItem.hoverBackground': '#FFFFFF1F',
	'statusBarItem.prominentBackground': '#FFFFFF1F',
	'statusBarItem.remoteBackground': '#FFFFFF',
	'statusBarItem.remoteForeground': '#000000',
	'tab.activeBackground': '#FFFFFF',
	'tab.activeBorder': '#000000',
	'tab.activeBorderTop': '#000000',
	'tab.activeForeground': '#000000',
	'tab.border': '#00000000',
	'tab.hoverBackground': '#F4F4F4',
	'tab.inactiveBackground': '#00000000',
	'tab.inactiveForeground': '#7E7E7E',
	'tab.lastPinnedBorder': '#C4C4C4',
	'tab.selectedBackground': '#FFFFFF',
	'tab.selectedBorderTop': '#000000',
	'tab.selectedForeground': '#000000',
	'tab.unfocusedActiveBorder': '#00000066',
	'tab.unfocusedActiveBorderTop': '#00000000',
	'tab.unfocusedHoverBackground': '#F4F4F4',
	'terminal.foreground': '#000000',
	'terminal.inactiveSelectionBackground': '#1414141F',
	'terminal.tab.activeBorder': '#000000',
	'terminalCursor.foreground': '#000000',
	'textBlockQuote.background': '#F4F4F4',
	'textBlockQuote.border': '#E8E8E8',
	'textCodeBlock.background': '#ECECEC',
	'textLink.activeForeground': '#000000',
	'textLink.foreground': '#000000',
	'textPreformat.background': '#ECECEC',
	'textPreformat.foreground': '#000000',
	'textSeparator.foreground': '#C4C4C4',
	'titleBar.activeBackground': '#FFFFFF',
	'titleBar.activeForeground': '#5A5A5A',
	'titleBar.border': '#00000000',
	'titleBar.inactiveBackground': '#FFFFFF',
	'titleBar.inactiveForeground': '#949494',
	'welcomePage.tileBackground': '#F4F4F4',
	'widget.border': '#00000000',
};

export interface IWorkbenchTheme {
	readonly id: string;
	readonly label: string;
	readonly extensionData?: ExtensionData;
	readonly description?: string;
	readonly settingsId: string | null;
}

export interface IWorkbenchColorTheme extends IWorkbenchTheme, IColorTheme {
	readonly settingsId: string;
	readonly tokenColors: ITextMateThemingRule[];
}

export interface IColorMap {
	[id: string]: Color;
}

export interface IWorkbenchFileIconTheme extends IWorkbenchTheme, IFileIconTheme {
}

export interface IWorkbenchProductIconTheme extends IWorkbenchTheme, IProductIconTheme {
	readonly settingsId: string;

	getIcon(icon: IconContribution): IconDefinition | undefined;
}

export type ThemeSettingTarget = ConfigurationTarget | undefined | 'auto' | 'preview';


export interface IWorkbenchThemeService extends IThemeService {
	readonly _serviceBrand: undefined;
	setColorTheme(themeId: string | undefined | IWorkbenchColorTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchColorTheme | null>;
	getColorTheme(): IWorkbenchColorTheme;
	/** Returns the selected theme and user customizations without window-local overlays. */
	getBaseColorTheme(): IWorkbenchColorTheme;
	getColorThemes(): Promise<IWorkbenchColorTheme[]>;
	getMarketplaceColorThemes(publisher: string, name: string, version: string): Promise<IWorkbenchColorTheme[]>;
	readonly onDidColorThemeChange: Event<IWorkbenchColorTheme>;

	/** Applies window-local colors computed from the base theme, without persisting them or changing the selected theme. */
	registerColorThemeOverlay(getColors: (theme: IWorkbenchColorTheme) => IColorMap): IDisposable;

	getPreferredColorScheme(): ColorScheme | undefined;

	setFileIconTheme(iconThemeId: string | undefined | IWorkbenchFileIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchFileIconTheme>;
	getFileIconTheme(): IWorkbenchFileIconTheme;
	getFileIconThemes(): Promise<IWorkbenchFileIconTheme[]>;
	getMarketplaceFileIconThemes(publisher: string, name: string, version: string): Promise<IWorkbenchFileIconTheme[]>;
	readonly onDidFileIconThemeChange: Event<IWorkbenchFileIconTheme>;

	setProductIconTheme(iconThemeId: string | undefined | IWorkbenchProductIconTheme, settingsTarget: ThemeSettingTarget): Promise<IWorkbenchProductIconTheme>;
	getProductIconTheme(): IWorkbenchProductIconTheme;
	getProductIconThemes(): Promise<IWorkbenchProductIconTheme[]>;
	getMarketplaceProductIconThemes(publisher: string, name: string, version: string): Promise<IWorkbenchProductIconTheme[]>;
	readonly onDidProductIconThemeChange: Event<IWorkbenchProductIconTheme>;
}

export interface IThemeScopedColorCustomizations {
	[colorId: string]: string;
}

export interface IColorCustomizations {
	[colorIdOrThemeScope: string]: IThemeScopedColorCustomizations | string;
}

export interface IThemeScopedTokenColorCustomizations {
	[groupId: string]: ITextMateThemingRule[] | ITokenColorizationSetting | boolean | string | undefined;
	comments?: string | ITokenColorizationSetting;
	strings?: string | ITokenColorizationSetting;
	numbers?: string | ITokenColorizationSetting;
	keywords?: string | ITokenColorizationSetting;
	types?: string | ITokenColorizationSetting;
	functions?: string | ITokenColorizationSetting;
	variables?: string | ITokenColorizationSetting;
	textMateRules?: ITextMateThemingRule[];
	semanticHighlighting?: boolean; // deprecated, use ISemanticTokenColorCustomizations.enabled instead
}

export interface ITokenColorCustomizations {
	[groupIdOrThemeScope: string]: IThemeScopedTokenColorCustomizations | ITextMateThemingRule[] | ITokenColorizationSetting | boolean | string | undefined;
	comments?: string | ITokenColorizationSetting;
	strings?: string | ITokenColorizationSetting;
	numbers?: string | ITokenColorizationSetting;
	keywords?: string | ITokenColorizationSetting;
	types?: string | ITokenColorizationSetting;
	functions?: string | ITokenColorizationSetting;
	variables?: string | ITokenColorizationSetting;
	textMateRules?: ITextMateThemingRule[];
	semanticHighlighting?: boolean; // deprecated, use ISemanticTokenColorCustomizations.enabled instead
}

export interface IThemeScopedSemanticTokenColorCustomizations {
	[styleRule: string]: ISemanticTokenRules | boolean | undefined;
	enabled?: boolean;
	rules?: ISemanticTokenRules;
}

export interface ISemanticTokenColorCustomizations {
	[styleRuleOrThemeScope: string]: IThemeScopedSemanticTokenColorCustomizations | ISemanticTokenRules | boolean | undefined;
	enabled?: boolean;
	rules?: ISemanticTokenRules;
}

export interface IThemeScopedExperimentalSemanticTokenColorCustomizations {
	[themeScope: string]: ISemanticTokenRules | undefined;
}

export interface IExperimentalSemanticTokenColorCustomizations {
	[styleRuleOrThemeScope: string]: IThemeScopedExperimentalSemanticTokenColorCustomizations | ISemanticTokenRules | undefined;
}

export type IThemeScopedCustomizations =
	IThemeScopedColorCustomizations
	| IThemeScopedTokenColorCustomizations
	| IThemeScopedExperimentalSemanticTokenColorCustomizations
	| IThemeScopedSemanticTokenColorCustomizations;

export type IThemeScopableCustomizations =
	IColorCustomizations
	| ITokenColorCustomizations
	| IExperimentalSemanticTokenColorCustomizations
	| ISemanticTokenColorCustomizations;

export interface ISemanticTokenRules {
	[selector: string]: string | ISemanticTokenColorizationSetting | undefined;
}

export interface ITextMateThemingRule {
	name?: string;
	scope?: string | string[];
	settings: ITokenColorizationSetting;
}

export interface ITokenColorizationSetting {
	foreground?: string;
	background?: string;
	fontStyle?: string; /* [italic|bold|underline|strikethrough] */
	fontFamily?: string;
	fontSize?: number;
	lineHeight?: number;
}

export interface ISemanticTokenColorizationSetting {
	foreground?: string;
	fontStyle?: string; /* [italic|bold|underline|strikethrough] */
	bold?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	italic?: boolean;
}

export interface ExtensionData {
	extensionId: string;
	extensionPublisher: string;
	extensionName: string;
	extensionIsBuiltin: boolean;
}

export namespace ExtensionData {
	export function toJSONObject(d: ExtensionData | undefined): any {
		return d && { _extensionId: d.extensionId, _extensionIsBuiltin: d.extensionIsBuiltin, _extensionName: d.extensionName, _extensionPublisher: d.extensionPublisher };
	}
	export function fromJSONObject(o: any): ExtensionData | undefined {
		if (o && isString(o._extensionId) && isBoolean(o._extensionIsBuiltin) && isString(o._extensionName) && isString(o._extensionPublisher)) {
			return { extensionId: o._extensionId, extensionIsBuiltin: o._extensionIsBuiltin, extensionName: o._extensionName, extensionPublisher: o._extensionPublisher };
		}
		return undefined;
	}
	export function fromName(publisher: string, name: string, isBuiltin = false): ExtensionData {
		return { extensionPublisher: publisher, extensionId: `${publisher}.${name}`, extensionName: name, extensionIsBuiltin: isBuiltin };
	}
}

export interface IThemeExtensionPoint {
	id: string;
	label?: string;
	description?: string;
	path: string;
	uiTheme?: ThemeTypeSelector;
	_watch: boolean; // unsupported options to watch location
}
