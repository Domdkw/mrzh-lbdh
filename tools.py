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

def quick_sort(arr, key=None):
    """
    快速排序
    Args:
        arr: 待排序列表
        key: 排序键函数，可选
    Returns:
        排序后的列表
    """
    if len(arr) <= 1:
        return arr
    
    pivot = arr[0]
    pivot_key = key(pivot) if key else pivot
    
    left = [x for x in arr[1:] if (key(x) if key else x) < pivot_key]
    right = [x for x in arr[1:] if (key(x) if key else x) >= pivot_key]
    
    return quick_sort(left, key) + [pivot] + quick_sort(right, key)
