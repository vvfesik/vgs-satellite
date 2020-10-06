from satellite.logging import configure_logging
from satellite.web_application import WebApplication


if __name__ == '__main__':
    configure_logging()
    app = WebApplication()
    app.start()
