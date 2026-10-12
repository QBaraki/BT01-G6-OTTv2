import json,sys
for line in sys.stdin:
 r=json.loads(line);print(json.dumps({'type':'action','protocolVersion':'1.0','requestId':r['requestId'],'turnId':r['turnId'],'action':{'type':'PROBE'}}),flush=True)
