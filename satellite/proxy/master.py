from mitmproxy.addons import default_addons
from mitmproxy.addons.view import View
from mitmproxy.master import Master as Master
from mitmproxy.options import Options
from mitmproxy.proxy.config import ProxyConfig

from ..vault.vault_handler import VaultFlows

from . import ProxyMode
from .server import ProxyServer


class ProxyMaster(Master):
    def __init__(self, mode: ProxyMode, port: int):
        mode = (
            f'{mode.value}:https://dummy-upstream'
            if mode == ProxyMode.REVERSE
            else mode.value
        )
        opts = Options(mode=mode, listen_port=port)
        super().__init__(opts)

        self.view = View()
        self.addons.add(*default_addons())
        self.addons.add(VaultFlows(), self.view)

        self.server = ProxyServer(ProxyConfig(opts))
