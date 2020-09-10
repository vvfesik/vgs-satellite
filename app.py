from mitmproxy import ctx
from satellite.web_application import WebApplication


if __name__ == '__main__':
    try:
        app = WebApplication()
        app.start()
    except KeyboardInterrupt:
        ctx.log.info("Exiting...")
