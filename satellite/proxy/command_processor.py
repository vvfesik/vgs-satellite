import logging
from typing import Any, List, Optional

from functools import singledispatchmethod

from . import commands
from ..flows import copy_flow, get_flow_state


logger = logging.getLogger(__file__)


class ProxyCommandProcessor:
    def __init__(self, proxy_process):
        self._proxy_process = proxy_process

    @property
    def master(self):
        return self._proxy_process.master

    @property
    def view(self):
        return self.master.view

    @singledispatchmethod
    def process_command(self, cmd) -> Any:
        raise NotImplementedError(f'Unknown command: {cmd}.')

    @process_command.register
    def _(self, _: commands.StopCommand):
        self._proxy_process.stop()

    @process_command.register
    def _(self, _: commands.GetFlowsCommand) -> List[dict]:
        return list(map(get_flow_state, self.view))

    @process_command.register
    def _(self, cmd: commands.GetFlowCommand) -> Optional[dict]:
        flow = self.view.get_by_id(cmd.flow_id)
        return flow and get_flow_state(flow)

    @process_command.register
    def _(self, cmd: commands.KillFlowCommand) -> Optional[str]:
        flow = self.view.get_by_id(cmd.flow_id)
        if flow and flow.killable:
            flow.kill()
            self.view.remove([flow])
            return True
        return False

    @process_command.register
    def _(self, cmd: commands.DuplicateFlowCommand) -> Optional[str]:
        flow = self.view.get_by_id(cmd.flow_id)
        if flow:
            new_flow = copy_flow(flow)
            self.view.add([new_flow])
            return new_flow.id

    @process_command.register
    def _(self, cmd: commands.ReplayFlowCommand):
        flow = self.view.get_by_id(cmd.flow_id)
        if not flow:
            return False

        flow.backup()
        flow.response = None
        self.view.update([flow])

        self.master.commands.call('replay.client', [flow])

        return True

    @process_command.register
    def _(self, cmd: commands.UpdateFlowCommand):
        flow = self.view.get_by_id(cmd.flow_id)
        if not flow:
            return False

        flow.backup()
        try:
            for a, b in cmd.flow_data.items():
                if a == 'request' and hasattr(flow, 'request'):
                    request = flow.request
                    for k, v in b.items():
                        if k in ['method', 'scheme', 'host', 'path', 'http_version']:
                            setattr(request, k, str(v))
                        elif k == 'port':
                            request.port = int(v)
                        elif k == 'headers':
                            request.headers.clear()
                            for header in v:
                                request.headers.add(*header)
                        elif k == 'content':
                            request.text = v
                        else:
                            raise Exception('Unknown request field.')

                elif a == 'response' and hasattr(flow, 'response'):
                    response = flow.response
                    for k, v in b.items():
                        if k in ['msg', 'http_version']:
                            setattr(response, k, str(v))
                        elif k == 'code':
                            response.status_code = int(v)
                        elif k == 'headers':
                            response.headers.clear()
                            for header in v:
                                response.headers.add(*header)
                        elif k == 'content':
                            response.text = v
                        else:
                            raise Exception('Unknown response field.')
                else:
                    raise Exception('Unknown flow field.')

        except Exception as exc:
            logger.error(f'Unable to update flow {flow.id}: {exc}')
            flow.revert()
            return False

        else:
            self.view.update([flow])

        return True
