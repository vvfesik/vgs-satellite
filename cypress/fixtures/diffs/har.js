export const bodyRequest = `1		{"foo": "bar"}`;
export const bodyResponse = `1		{
2		  "args": {}, 
3		  "data": "{\\"foo\\": \\"bar\\"}", 
4		  "files": {}, 
5		  "form": {}, 
6		  "headers": {
7		    "Accept": "*/*", 
8		    "Content-Length": "14", 
9		    "Content-Type": "application/json", 
10		    "Host": "httpbin.org", 
11		    "Proxy-Connection": "Keep-Alive", 
12		    "User-Agent": "curl/7.64.1", 
13		    "X-Amzn-Trace-Id": "Root=1-5e568d46-121257eeb4ab060a1c8591c0"
14		  }, 
15		  "json": {
16		    "foo": "bar"
17		  }, 
18		  "origin": "46.219.215.255", 
19		  "url": "http://httpbin.org/post"
20		}`;
