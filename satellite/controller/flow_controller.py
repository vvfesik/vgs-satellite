from mitmproxy import contentviews
from mitmproxy import exceptions

from satellite.controller import BaseHandler, logentry_to_json, flow_to_json, APIError


class Index(BaseHandler):
    def head(self):
        self.set_status(200)
        self.finish()


class Events(BaseHandler):
    def get(self):
        self.write([logentry_to_json(e) for e in self.master.events.data])


class FlowHandler(BaseHandler):
    def delete(self, flow_id):
        if self.flow.killable:
            self.flow.kill()
        self.view.remove([self.flow])
        self.set_status(200)

    def put(self, flow_id):
        flow = self.flow
        flow.backup()
        try:
            for a, b in self.json.items():
                if a == "request" and hasattr(flow, "request"):
                    request = flow.request
                    for k, v in b.items():
                        if k in ["method", "scheme", "host", "path", "http_version"]:
                            setattr(request, k, str(v))
                        elif k == "port":
                            request.port = int(v)
                        elif k == "headers":
                            request.headers.clear()
                            for header in v:
                                request.headers.add(*header)
                        elif k == "content":
                            request.text = v
                        else:
                            raise APIError(400, "Unknown update request.{}: {}".format(k, v))

                elif a == "response" and hasattr(flow, "response"):
                    response = flow.response
                    for k, v in b.items():
                        if k in ["msg", "http_version"]:
                            setattr(response, k, str(v))
                        elif k == "code":
                            response.status_code = int(v)
                        elif k == "headers":
                            response.headers.clear()
                            for header in v:
                                response.headers.add(*header)
                        elif k == "content":
                            response.text = v
                        else:
                            raise APIError(400, "Unknown update response.{}: {}".format(k, v))
                else:
                    raise APIError(400, "Unknown update {}: {}".format(a, b))
        except APIError:
            flow.revert()
            raise
        self.view.update([flow])


class ClearAll(BaseHandler):
    def post(self):
        self.view.clear()
        self.master.events.clear()


class KillFlow(BaseHandler):
    def post(self, flow_id):
        if self.flow.killable:
            self.flow.kill()
            self.view.update([self.flow])


class ResumeFlow(BaseHandler):
    def post(self, flow_id):
        self.flow.resume()
        self.view.update([self.flow])


class KillFlows(BaseHandler):
    def post(self):
        for f in self.view:
            if f.killable:
                f.kill()
                self.view.update([f])


class ResumeFlows(BaseHandler):
    def post(self):
        for f in self.view:
            f.resume()
            self.view.update([f])


class DuplicateFlow(BaseHandler):
    def post(self, flow_id):
        f = self.flow.copy()
        self.view.add([f])
        self.write(f.id)


class ReplayFlow(BaseHandler):
    def post(self, flow_id):
        self.flow.backup()
        self.flow.response = None
        self.view.update([self.flow])

        try:
            self.master.commands.call("replay.client", [self.flow])
        except exceptions.ReplayException as e:
            raise APIError(400, str(e))


class FlowContentView(BaseHandler):
    def get(self, flow_id, message, content_view):
        message = getattr(self.flow, message)

        description, lines, error = contentviews.get_message_content_view(
            content_view.replace('_', ' '), message, self.flow
        )
        #        if error:
        #           add event log

        self.write(dict(
            lines=list(lines),
            description=description
        ))


class Flows(BaseHandler):

    def get(self):
        self.write([flow_to_json(f) for f in self.view])
