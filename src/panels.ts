export interface PanelConfigItem {
  app_context: string
  panel_key: string
  title: string
  description: string
  component_key: string
  role_scope: string[]
  metadata: Record<string, unknown>
  default_visible: boolean
  default_order: number
  forced_visible: boolean | null
  forced_order: number | null
  user_visible: boolean | null
  user_order: number | null
  effective_visible: boolean
  effective_order: number
}
