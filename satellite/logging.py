import logging


def configure_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='[%(levelname)s][%(processName)s][%(threadName)s] %(message)s',
    )
