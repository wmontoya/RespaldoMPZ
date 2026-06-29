
const getSessionId = ( () => {
    let sessionId: string | null = null;
  
    return async (needRefresh: boolean = false): Promise<string> => {

        const { API_ODOO_DATABASE, API_ODOO_REQUEST,API_ODOO_PASSWORD,API_ODOO_USERNAME } = process.env;
      if (sessionId && !needRefresh) {
        return sessionId;
      }
     
      const response = await fetch(`${API_ODOO_REQUEST}/web/session/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          params: { db: API_ODOO_DATABASE, login: API_ODOO_USERNAME, password: API_ODOO_PASSWORD}
        }),
      });
 
      if (!response.ok) {
        throw new Error("Failed to authenticate");
      }
 
      const cookies = response.headers.get("set-cookie");
      if (!cookies) {
        throw new Error("No session_id found in cookies");
      }
 
      const sessionIdMatch = cookies.match(/session_id=([^;]+)/);
      if (!sessionIdMatch) {
        throw new Error("No session_id found in cookies");
      }
 
      sessionId = sessionIdMatch[1];
 
      return sessionId;
    };
  })();
 
  export default getSessionId;