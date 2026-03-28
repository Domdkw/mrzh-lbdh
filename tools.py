import json

#截取某字符串到某字符串中间的字符串
def getStringBetween(str, startstr, endstr):
    start_index = str.find(startstr)
    if start_index == -1:
        return ""
    end_index = str.find(endstr, start_index + len(startstr))
    if end_index == -1:
        return ""
    return str[start_index + len(startstr):end_index]
