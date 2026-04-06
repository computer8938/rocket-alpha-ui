export interface SharedAuthProvider {
  key: 'local' | 'google' | 'kakao'
  enabled: boolean
  display_name: string
  status?: string
}

export interface SharedAuthUser<Role extends string = string> {
  id: string
  name: string
  email: string
  role: Role
  status: 'active' | 'disabled' | 'invited'
  last_login_at?: string | null
  created_at?: string | null
}

export interface SharedAuthSession {
  session_id: string
  expires_at: string
}

export interface SharedPanelConfigItem {
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

export interface UiBundleMenuItem {
  menu_key: string
  route_name: string
  label: string
  caption: string
  requires_auth: boolean
  role_scope: string[]
  sort_order: number
  children: UiBundleMenuItem[]
}

export interface UiBundle {
  app: string
  locale: string
  version: number
  terms: Record<string, string>
  shell: {
    heading: string
    description: string
    session_label: string
  }
  menus: UiBundleMenuItem[]
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `Request failed: ${response.status} ${response.statusText}`
    try {
      const payload = (await response.json()) as { detail?: string | Array<{ msg?: string }> }
      if (typeof payload.detail === 'string') {
        detail = payload.detail
      } else if (Array.isArray(payload.detail) && payload.detail.length > 0) {
        detail = payload.detail.map((item) => item.msg ?? 'Validation error').join(', ')
      }
    } catch {
      // ignore json parse failure
    }
    throw new Error(detail)
  }

  return (await response.json()) as T
}

async function fetchAuthJson<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  return parseResponse<T>(response)
}

export function createAuthApiClient<Role extends string = string>(baseUrl = '/api/auth') {
  return {
    fetchCurrentSession() {
      return fetchAuthJson<{
        authenticated: boolean
        user: SharedAuthUser<Role> | null
        session_id: string | null
        expires_at: string | null
      }>(baseUrl, '/session')
    },
    loginWithPassword(email: string, password: string) {
      return fetchAuthJson<{ user: SharedAuthUser<Role>; session: SharedAuthSession }>(baseUrl, '/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
    },
    logoutCurrentSession() {
      return fetchAuthJson(baseUrl, '/logout', {
        method: 'POST',
        body: JSON.stringify({}),
      })
    },
    async fetchAuthProviders() {
      const payload = await fetchAuthJson<{ providers: SharedAuthProvider[] }>(baseUrl, '/providers')
      return payload.providers
    },
    fetchUiBundle(app: string, locale = 'ko-KR') {
      return fetchAuthJson<UiBundle>(baseUrl, `/ui/bundle?app=${encodeURIComponent(app)}&locale=${encodeURIComponent(locale)}`, {
        method: 'GET',
      })
    },
    async fetchRoles() {
      const response = await fetch(`${baseUrl}/roles`, {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      const payload = await parseResponse<{ roles: Array<{ code: Role; name: string; description: string }> }>(response)
      return payload.roles
    },
    async fetchUsers() {
      const payload = await fetchAuthJson<{ users: SharedAuthUser<Role>[] }>(baseUrl, '/admin/users', {
        method: 'GET',
      })
      return payload.users
    },
    async createAuthUser(input: {
      email: string
      name: string
      role: Role
      status: 'active' | 'disabled' | 'invited'
      password?: string
    }) {
      const payload = await fetchAuthJson<{ user: SharedAuthUser<Role> }>(baseUrl, '/admin/users', {
        method: 'POST',
        body: JSON.stringify(input),
      })
      return payload.user
    },
    async updateAuthUser(
      userId: string,
      input: { name?: string; role?: Role; status?: 'active' | 'disabled' | 'invited'; password?: string },
    ) {
      const payload = await fetchAuthJson<{ user: SharedAuthUser<Role> }>(baseUrl, `/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      })
      return payload.user
    },
    async fetchPanelCatalog(app: string) {
      const payload = await fetchAuthJson<{ items: SharedPanelConfigItem[] }>(
        baseUrl,
        `/panels/catalog?app=${encodeURIComponent(app)}`,
        { method: 'GET' },
      )
      return payload.items
    },
    async fetchPanelConfig(app: string) {
      const payload = await fetchAuthJson<{ items: SharedPanelConfigItem[] }>(
        baseUrl,
        `/panels/config?app=${encodeURIComponent(app)}`,
        { method: 'GET' },
      )
      return payload.items
    },
    async savePanelPreferences(
      app: string,
      items: Array<{ panel_key: string; is_visible: boolean | null; display_order: number | null }>,
    ) {
      const payload = await fetchAuthJson<{ items: SharedPanelConfigItem[] }>(
        baseUrl,
        `/panels/preferences?app=${encodeURIComponent(app)}`,
        {
          method: 'PUT',
          body: JSON.stringify({ items }),
        },
      )
      return payload.items
    },
    async fetchAdminPanelConfig(app: string) {
      const payload = await fetchAuthJson<{ items: SharedPanelConfigItem[] }>(
        baseUrl,
        `/admin/panels/config?app=${encodeURIComponent(app)}`,
        { method: 'GET' },
      )
      return payload.items
    },
    async saveAdminPanelConfig(
      app: string,
      items: Array<{ panel_key: string; forced_visible: boolean | null; forced_order: number | null }>,
    ) {
      const payload = await fetchAuthJson<{ items: SharedPanelConfigItem[] }>(
        baseUrl,
        `/admin/panels/config?app=${encodeURIComponent(app)}`,
        {
          method: 'PUT',
          body: JSON.stringify({ items }),
        },
      )
      return payload.items
    },
    async listUiTerms(app?: string, category?: string) {
      const params = new URLSearchParams()
      if (app) params.set('app', app)
      if (category) params.set('category', category)
      const suffix = params.toString() ? `?${params.toString()}` : ''
      const payload = await fetchAuthJson<{ items: Array<Record<string, unknown>> }>(baseUrl, `/admin/ui/terms${suffix}`, { method: 'GET' })
      return payload.items
    },
    async createUiTerm(input: Record<string, unknown>) {
      const payload = await fetchAuthJson<{ item: Record<string, unknown> }>(baseUrl, '/admin/ui/terms', {
        method: 'POST',
        body: JSON.stringify(input),
      })
      return payload.item
    },
    async updateUiTerm(termKey: string, input: Record<string, unknown>) {
      const payload = await fetchAuthJson<{ item: Record<string, unknown> }>(baseUrl, `/admin/ui/terms/${encodeURIComponent(termKey)}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      })
      return payload.item
    },
    async deleteUiTerm(termKey: string) {
      const payload = await fetchAuthJson<{ item: Record<string, unknown> }>(baseUrl, `/admin/ui/terms/${encodeURIComponent(termKey)}`, {
        method: 'DELETE',
      })
      return payload.item
    },
    async listUiMenus(app: string) {
      const payload = await fetchAuthJson<{ items: Array<Record<string, unknown>> }>(baseUrl, `/admin/ui/menus?app=${encodeURIComponent(app)}`, { method: 'GET' })
      return payload.items
    },
    async createUiMenu(app: string, input: Record<string, unknown>) {
      const payload = await fetchAuthJson<{ item: Record<string, unknown> }>(baseUrl, `/admin/ui/menus?app=${encodeURIComponent(app)}`, {
        method: 'POST',
        body: JSON.stringify(input),
      })
      return payload.item
    },
    async updateUiMenu(app: string, menuKey: string, input: Record<string, unknown>) {
      const payload = await fetchAuthJson<{ item: Record<string, unknown> }>(baseUrl, `/admin/ui/menus/${encodeURIComponent(menuKey)}?app=${encodeURIComponent(app)}`, {
        method: 'PUT',
        body: JSON.stringify(input),
      })
      return payload.item
    },
    async deleteUiMenu(app: string, menuKey: string) {
      const payload = await fetchAuthJson<{ item: Record<string, unknown> }>(baseUrl, `/admin/ui/menus/${encodeURIComponent(menuKey)}?app=${encodeURIComponent(app)}`, {
        method: 'DELETE',
      })
      return payload.item
    },
  }
}
