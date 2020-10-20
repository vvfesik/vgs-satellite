import logging


LOG_FORMAT = '[%(levelname)s][%(processName)s][%(threadName)s] %(message)s'


def configure(log_path: str = None):
    root = logging.getLogger()
    formatter = logging.Formatter(LOG_FORMAT)

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)
    root.addHandler(stream_handler)

    if log_path:
        file_handler = logging.FileHandler(log_path)
        file_handler.setFormatter(formatter)
        root.addHandler(file_handler)

    root.setLevel(logging.INFO)
