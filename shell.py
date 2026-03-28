import subprocess
import sys
import os
import tempfile
import socket
import time


class Shell:
    def __init__(self):
        self.is_open = False
        self._temp_script = None
        self._socket = None
        self._port = 19999

    def open(self):
        """
        打开一个子命令行窗口
        """
        if self.is_open:
            return

        try:
            # 创建临时脚本文件
            self._temp_script = tempfile.NamedTemporaryFile(
                mode='w', 
                suffix='.py', 
                delete=False,
                encoding='utf-8'
            )
            self._temp_script.write(self._get_display_script())
            self._temp_script.close()

            # 使用 start 命令启动完全独立的窗口
            subprocess.Popen(
                ['cmd.exe', '/c', 'start', 'cmd.exe', '/K', 
                 sys.executable, '-u', self._temp_script.name],
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                stdin=subprocess.DEVNULL
            )
            
            # 等待子进程启动并连接
            time.sleep(0.8)
            self._connect()
            self.is_open = True
            
        except Exception as e:
            print(f"打开命令行窗口失败：{e}")
            self.is_open = False

    def _get_display_script(self):
        """
        返回子窗口运行的 Python 脚本
        """
        return f'''
import sys
import os
import socket

os.system("title Shell Output")
os.system("cls")
sys.stdout.write("=== Shell Output Window ===\\n")
sys.stdout.write("Waiting for output...\\n\\n")
sys.stdout.flush()

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(('127.0.0.1', {self._port}))
server.listen(1)
server.settimeout(60)

try:
    conn, addr = server.accept()
    conn.settimeout(None)
    while True:
        data = conn.recv(65536)
        if not data:
            break
        sys.stdout.write(data.decode('utf-8', errors='replace'))
        sys.stdout.flush()
except:
    pass
finally:
    server.close()
'''

    def _connect(self):
        """
        连接到子窗口的 socket
        """
        for _ in range(20):
            try:
                self._socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self._socket.connect(('127.0.0.1', self._port))
                return
            except:
                time.sleep(0.1)
        
        self._socket = None

    def print(self, *args, **kwargs):
        """
        往子命令行窗口打印内容
        用法：shell.print("内容 1", "内容 2", sep=" ", end="\n")
        """
        if not self.is_open or self._socket is None:
            return

        sep = kwargs.get('sep', ' ')
        end = kwargs.get('end', '\n')
        content = sep.join(str(arg) for arg in args) + end

        try:
            self._socket.send(content.encode('utf-8'))
        except:
            pass

    def exec(self, command):
        """
        在子命令行中执行命令（打印命令）
        """
        self.print(f"> {command}")

    def close(self):
        """
        关闭子命令行窗口
        """
        if self._socket:
            try:
                self._socket.close()
            except:
                pass
        
        if self._temp_script and os.path.exists(self._temp_script.name):
            try:
                os.unlink(self._temp_script.name)
            except:
                pass
        
        self.is_open = False


# 全局 shell 实例
shell = Shell()
