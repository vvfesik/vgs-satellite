export const bodyRequests = [
// delete
'No payload found',
// put
'No payload found',
// patch
'No payload found',
// get
'No payload found',
// post
`1		{"foo": "bar"}`,
];
export const bodyResponses = [
// delete
`1		{
2		  "args": {}, 
3		  "data": "", 
4		  "files": {}, 
5		  "form": {}, 
6		  "headers": {
7		    "Accept": "application/json", 
8		    "Accept-Encoding": "gzip, deflate, br", 
9		    "Accept-Language": "uk-UA,uk;q=0.9,ru;q=0.8,en-US;q=0.7,en;q=0.6", 
10		    "Cache-Control": "no-cache", 
11		    "Host": "httpbin.org", 
12		    "Origin": "https://httpbin.org", 
13		    "Pragma": "no-cache", 
14		    "Referer": "https://httpbin.org/", 
15		    "Sec-Fetch-Dest": "empty", 
16		    "Sec-Fetch-Mode": "cors", 
17		    "Sec-Fetch-Site": "same-origin", 
18		    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36", 
19		    "X-Amzn-Trace-Id": "Root=1-5e8dcc05-2e439c88d36eea5f82e06d7b"
20		  }, 
21		  "json": null, 
22		  "origin": "188.163.115.30", 
23		  "url": "https://httpbin.org/delete"
24		}`,
// put
`1		{
2		  "args": {}, 
3		  "data": "", 
4		  "files": {}, 
5		  "form": {}, 
6		  "headers": {
7		    "Accept": "application/json", 
8		    "Accept-Encoding": "gzip, deflate, br", 
9		    "Accept-Language": "uk-UA,uk;q=0.9,ru;q=0.8,en-US;q=0.7,en;q=0.6", 
10		    "Cache-Control": "no-cache", 
11		    "Content-Length": "0", 
12		    "Host": "httpbin.org", 
13		    "Origin": "https://httpbin.org", 
14		    "Pragma": "no-cache", 
15		    "Referer": "https://httpbin.org/", 
16		    "Sec-Fetch-Dest": "empty", 
17		    "Sec-Fetch-Mode": "cors", 
18		    "Sec-Fetch-Site": "same-origin", 
19		    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36", 
20		    "X-Amzn-Trace-Id": "Root=1-5e8dcbfd-deecdbbb7b12adbdad23a652"
21		  }, 
22		  "json": null, 
23		  "origin": "188.163.115.30", 
24		  "url": "https://httpbin.org/put"
25		}`,
// patch
`1		{
2		  "args": {}, 
3		  "data": "", 
4		  "files": {}, 
5		  "form": {}, 
6		  "headers": {
7		    "Accept": "application/json", 
8		    "Accept-Encoding": "gzip, deflate, br", 
9		    "Accept-Language": "uk-UA,uk;q=0.9,ru;q=0.8,en-US;q=0.7,en;q=0.6", 
10		    "Cache-Control": "no-cache", 
11		    "Host": "httpbin.org", 
12		    "Origin": "https://httpbin.org", 
13		    "Pragma": "no-cache", 
14		    "Referer": "https://httpbin.org/", 
15		    "Sec-Fetch-Dest": "empty", 
16		    "Sec-Fetch-Mode": "cors", 
17		    "Sec-Fetch-Site": "same-origin", 
18		    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36", 
19		    "X-Amzn-Trace-Id": "Root=1-5e8dcbf2-ed6ce6e58f076788690bbcee"
20		  }, 
21		  "json": null, 
22		  "origin": "188.163.115.30", 
23		  "url": "https://httpbin.org/patch"
24		}`,
// get
`1		{
2		  "args": {}, 
3		  "headers": {
4		    "Accept": "application/json", 
5		    "Accept-Encoding": "gzip, deflate, br", 
6		    "Accept-Language": "uk-UA,uk;q=0.9,ru;q=0.8,en-US;q=0.7,en;q=0.6", 
7		    "Cache-Control": "no-cache", 
8		    "Host": "httpbin.org", 
9		    "Pragma": "no-cache", 
10		    "Referer": "https://httpbin.org/", 
11		    "Sec-Fetch-Dest": "empty", 
12		    "Sec-Fetch-Mode": "cors", 
13		    "Sec-Fetch-Site": "same-origin", 
14		    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36", 
15		    "X-Amzn-Trace-Id": "Root=1-5e8dcbce-b6023ec2b2f1b9f02793bd1f"
16		  }, 
17		  "origin": "188.163.115.30", 
18		  "url": "https://httpbin.org/get"
19		}`,
// post
`1		{
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
20		}`,
];
