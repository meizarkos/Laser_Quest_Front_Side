class TokenStore {
  private static instance: TokenStore;
  private token: string = "";

  private constructor() {
    const storedToken = localStorage.getItem("auth_token");
    if (storedToken) {
      this.token = storedToken;
    }
  }

  public static getInstance(): TokenStore {
    if (!TokenStore.instance) {
      TokenStore.instance = new TokenStore();
    }
    return TokenStore.instance;
  }

  public setToken(token: string) {
    this.token = token;
    localStorage.setItem("auth_token", token); // Persist
  }

  public getToken(): string | null {
    return this.token || localStorage.getItem("auth_token");
  }

  public clearToken() {
    this.token = "";
    localStorage.removeItem("auth_token");
  }
}

export default TokenStore.getInstance();