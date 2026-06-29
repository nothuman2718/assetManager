const authTokenKey = 'ems.auth.token'

export const authStorage = {
  getToken: () => localStorage.getItem(authTokenKey),
  setToken: (token: string) => localStorage.setItem(authTokenKey, token),
  clearToken: () => localStorage.removeItem(authTokenKey),
}
