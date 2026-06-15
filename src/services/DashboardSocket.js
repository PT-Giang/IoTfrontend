class DashboardSocket {
  constructor() {
    this.ws = null;
    this.shouldReconnect = false;
  }

  connect(onMessage) {
    this.shouldReconnect = true;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";

    const host = process.env.REACT_APP_API_HOST || "localhost:8000";

    this.ws = new WebSocket(`${protocol}://${host}/api/dashboard/ws`);

    this.ws.onopen = () => {
      console.log("WS Connected");
    };

    this.ws.onmessage = (event) => {
      const payload = JSON.parse(event.data);

      onMessage(payload);
    };

    this.ws.onclose = () => {
      console.log("WS Closed");

      if (this.shouldReconnect) {
        setTimeout(() => {
          this.connect(onMessage);
        }, 3000);
      }
    };

    this.ws.onerror = (err) => {
      console.error(err);
    };
  }

  disconnect() {
    this.shouldReconnect = false;

    if (this.ws) {
      this.ws.close();
    }
  }
}

const dashboardSocket = new DashboardSocket();

export default dashboardSocket;
