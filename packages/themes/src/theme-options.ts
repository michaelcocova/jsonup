import type { JsonupTheme } from './types.ts'
import { Andromeeda } from './themes/andromeeda.ts'
import { AuroraX } from './themes/aurora-x.ts'
import { AyuDark } from './themes/ayu-dark.ts'
import { AyuLight } from './themes/ayu-light.ts'
import { AyuMirage } from './themes/ayu-mirage.ts'
import { DarkPlus } from './themes/dark-plus.ts'
import { DraculaSoft } from './themes/dracula-soft.ts'
import { Dracula } from './themes/dracula.ts'
import { EverforestDark } from './themes/everforest-dark.ts'
import { EverforestLight } from './themes/everforest-light.ts'
import { GithubDarkDimmed } from './themes/github-dark-dimmed.ts'
import { GithubDarkHighContrast } from './themes/github-dark-high-contrast.ts'
import { GithubDark } from './themes/github-dark.ts'
import { GithubLightHighContrast } from './themes/github-light-high-contrast.ts'
import { GithubLight } from './themes/github-light.ts'
import { GruvboxDarkHard } from './themes/gruvbox-dark-hard.ts'
import { GruvboxDarkMedium } from './themes/gruvbox-dark-medium.ts'
import { LightPlus } from './themes/light-plus.ts'
import { MaterialThemeDarker } from './themes/material-theme-darker.ts'
import { MaterialThemeLighter } from './themes/material-theme-lighter.ts'
import { MaterialThemeOcean } from './themes/material-theme-ocean.ts'
import { MaterialThemePalenight } from './themes/material-theme-palenight.ts'
import { MaterialTheme } from './themes/material-theme.ts'
import { MinDark } from './themes/min-dark.ts'
import { MinLight } from './themes/min-light.ts'
import { NightOwlLight } from './themes/night-owl-light.ts'
import { NightOwl } from './themes/night-owl.ts'
import { OneDarkPro } from './themes/one-dark-pro.ts'
import { OneDark } from './themes/one-dark.ts'
import { OneLight } from './themes/one-light.ts'
import { SlackDark } from './themes/slack-dark.ts'
import { SlackOchin } from './themes/slack-ochin.ts'
import { SnazzyLight } from './themes/snazzy-light.ts'
import { SolarizedDark } from './themes/solarized-dark.ts'
import { SolarizedLight } from './themes/solarized-light.ts'
import { VitesseDark } from './themes/vitesse-dark.ts'
import { VitesseLight } from './themes/vitesse-light.ts'

/**
 * Jsonup 主题选项接口
 */
export interface JsonupThemeOption {
  /**
   * 主题显示名称
   */
  label: string
  /**
   * 主题值（标识符）
   */
  value: string
  /**
   * 具体的主题配置对象
   */
  theme: JsonupTheme
}

/**
 * 所有预设主题的选项列表
 */
export const themeOptions: JsonupThemeOption[] = [
  { label: 'Andromeeda', value: 'andromeeda', theme: Andromeeda },
  { label: 'Aurora X', value: 'aurora-x', theme: AuroraX },
  { label: 'Ayu Dark', value: 'ayu-dark', theme: AyuDark },
  { label: 'Ayu Light', value: 'ayu-light', theme: AyuLight },
  { label: 'Ayu Mirage', value: 'ayu-mirage', theme: AyuMirage },
  { label: 'Dark Plus', value: 'dark-plus', theme: DarkPlus },
  { label: 'Dracula Theme', value: 'dracula', theme: Dracula },
  { label: 'Dracula Theme Soft', value: 'dracula-soft', theme: DraculaSoft },
  { label: 'Everforest Dark', value: 'everforest-dark', theme: EverforestDark },
  { label: 'Everforest Light', value: 'everforest-light', theme: EverforestLight },
  { label: 'GitHub Dark', value: 'github-dark', theme: GithubDark },
  { label: 'GitHub Dark Dimmed', value: 'github-dark-dimmed', theme: GithubDarkDimmed },
  {
    label: 'GitHub Dark High Contrast',
    value: 'github-dark-high-contrast',
    theme: GithubDarkHighContrast,
  },
  { label: 'GitHub Light', value: 'github-light', theme: GithubLight },
  {
    label: 'GitHub Light High Contrast',
    value: 'github-light-high-contrast',
    theme: GithubLightHighContrast,
  },
  { label: 'Gruvbox Dark Hard', value: 'gruvbox-dark-hard', theme: GruvboxDarkHard },
  {
    label: 'Gruvbox Dark Medium',
    value: 'gruvbox-dark-medium',
    theme: GruvboxDarkMedium,
  },
  { label: 'Light Plus', value: 'light-plus', theme: LightPlus },
  { label: 'Material Theme', value: 'material-theme', theme: MaterialTheme },
  {
    label: 'Material Theme Darker',
    value: 'material-theme-darker',
    theme: MaterialThemeDarker,
  },
  {
    label: 'Material Theme Lighter',
    value: 'material-theme-lighter',
    theme: MaterialThemeLighter,
  },
  {
    label: 'Material Theme Ocean',
    value: 'material-theme-ocean',
    theme: MaterialThemeOcean,
  },
  {
    label: 'Material Theme Palenight',
    value: 'material-theme-palenight',
    theme: MaterialThemePalenight,
  },
  { label: 'Min Dark', value: 'min-dark', theme: MinDark },
  { label: 'Min Light', value: 'min-light', theme: MinLight },
  { label: 'Night Owl', value: 'night-owl', theme: NightOwl },
  { label: 'Night Owl Light', value: 'night-owl-light', theme: NightOwlLight },
  { label: 'One Dark', value: 'one-dark', theme: OneDark },
  { label: 'One Dark Pro', value: 'one-dark-pro', theme: OneDarkPro },
  { label: 'One Light', value: 'one-light', theme: OneLight },
  { label: 'Slack Dark', value: 'slack-dark', theme: SlackDark },
  { label: 'Slack Ochin', value: 'slack-ochin', theme: SlackOchin },
  { label: 'Snazzy Light', value: 'snazzy-light', theme: SnazzyLight },
  { label: 'Solarized Dark', value: 'solarized-dark', theme: SolarizedDark },
  { label: 'Solarized Light', value: 'solarized-light', theme: SolarizedLight },
  { label: 'Vitesse Dark', value: 'vitesse-dark', theme: VitesseDark },
  { label: 'Vitesse Light', value: 'vitesse-light', theme: VitesseLight },
]

/**
 * 根据主题值查找对应的主题配置
 *
 * @param value - 要查找的主题值（标识符）
 * @returns 查找到的主题配置对象，如果未找到则返回 undefined
 */
export function findTheme(value?: string) {
  return value ? themeOptions.find(item => item.value === value)?.theme : void 0
}

/**
 * 以键值对形式导出的所有主题对象字典
 * 键为主题值，值为主题配置对象
 */
export const themes = Object.fromEntries(
  themeOptions.map(item => [item.value, item.theme]),
) as Record<string, JsonupTheme>
