#Clion+STM32开发教程
##Clion+STM32开发教程1:下载与运行



### 前情提要

Clion是一个非常强大的C/C++**代码编辑器** 有很多很好用的功能 可以有ai助手 可以对你的冗余代码进行重构 有高级调试功能 总之十分方便 

我们还需要STM32CUBEMX这一个**代码生成器** 和Clion进行联合开发

而Clion和STM32CUBEMX之间还需要一些东西 在之前是需要一个一个下 然后部署到Path环境变量里去的 但STM32推出了一个STM32CLT 集成了我们需要的这些东西 所以 我们还需要下载一个**代码编译工具链 STM32CLT**

以下是三个软件的下载流程



### 下载Clion

[Download CLion: A Smart Cross-Platform IDE for C and C++](https://www.jetbrains.com/clion/download/#section=windows)

点击链接去下载

![image-20250528142556572](../images/image-20250528142556572-b34e83f6.png)

安装目录可以默认 也可以自己建个文件夹 **保证Clion CUBEMX 和CUBECLT在同一根目录下就好**





![image-20250528142801216](../images/image-20250528142801216-1e64e1f8.png)

这里全选 然后下一步 直接安装



###下载CUBEMX和CUBECLT

[FubeMX软件下载](https://fubemx.keysking.com/)

可以在这个软件里下载 不需要登陆ST官网 下的也挺快

或者也可以去官网自行下载

[STM32CubeMX ](https://www.st.com.cn/zh/development-tools/stm32cubemx.html)

[STM32CubeCLT ](https://www.st.com/en/development-tools/stm32cubeclt.html)



#### STM32CUBEMX下载

![image-20250528143740110](../images/image-20250528143740110-33c04817.png)

选第二个 然后把要勾选的都勾选上 一直下一步

最后点done 下载完成



#### STM32CUBECLT下载

![image-20250528145050331](../images/image-20250528145050331-f3140deb.png)

选择ST-LINK drivers 然后等待下载完成





![image-20250528145710054](../images/image-20250528145710054-963c3e7a.png)

打开对应的目录可以看到我们需要的



CMake(帮我们规划代码结构 确定代码之间的依赖关系与编译流程)

ARM-GCC(开源编译器 用于将代码编译成STM32可以运行的机器语言)

而CMake不能直接操作GCC 而是通过将需求给Ninja或者Makefile 再由他们操作GCC完成编译

![image-20250528150008161](../images/image-20250528150008161-ad2e028b.png)

STM32官方选择了速度更快的Ninja方案



### 初尝Clion+STM32开发 开爽！

#### 配置Clion

打开Clion

![image-20250528150637609](../images/image-20250528150637609-be790687.png)

选择中文语言包-下一个-同意条款-继续



![image-20250528150736963](../images/image-20250528150736963-5a935695.png)

自行选择





![image-20250528150753626](../images/image-20250528150753626-974d3c3e.png)

选择免费非商业使用





![image-20250528150818008](../images/image-20250528150818008-60899951.png)

自行注册登录





![image-20250528150856915](../images/image-20250528150856915-3a1dc647.png)

进去之后就是这样 看起来很舒服 至少比keil那个老古董舒服多了 也没有CUBEIDE那么冗余





点击新建项目

![image-20250528151027143](../images/image-20250528151027143-92d2a66d.png)

在stm32cubemx界面里发现mx和clt都被自动识别到了 如果你之前的保存路径不在默认路径的话 可以自行编辑 选择自己的路径





#### 配置STM32CUBEMX

![image-20250528151226658](../images/image-20250528151226658-234470ec.png)

打开后点击

ACCESS TO MCU SELECTOR





选择你的芯片 然后配置就好了 我这里选择的是STM32F103C8T6

![image-20250528151428313](../images/image-20250528151428313-a31e52f9.png)

因为我用的是STLINK 所以SYS里Debug选择Serial Wire 





![image-20250528151902841](../images/image-20250528151902841-76129bf5.png)

在Project Manager里给自己的工程文件命名 然后在合理的地方选择自己代码放的位置 最重要的是将工具链Tool train选择CMake

点击生成代码 





![image-20250528152353975](../images/image-20250528152353975-b9d8d7df.png)

打开文件所在文件夹 复制路径



#### 继续配置Clion

![image-20250528152421650](../images/image-20250528152421650-47150120.png)

粘贴在你的clion的这里

然后继续并信任文件夹 





![image-20250528152709962](../images/image-20250528152709962-09fdf8dd.png)

然后会跳出这个框 Clion自带的MinGW固然好用 但以防万一 我们还是用CLT的Mingw



![image-20250528152805164](../images/image-20250528152805164-d03a784e.png)

选择+ 点击系统





CMake选择文件夹 打开你下载的cubeclt CMake-bin 点击cmake 然后点打开

![image-20250528153046690](../images/image-20250528153046690-3814ac5c.png)

完成之后是这样





下面三个类似 

![image-20250528153253715](../images/image-20250528153253715-badb8a7f.png)

最终是这样 不知道点哪个文件夹的可以看图片里的路径





而最后的调试器 当然可以替换为clt的调试器 但他没有clion自带的调试器强大 比如clt的调试器不能用python脚本调试freertos 所以调试器这里我们选择不变 点击下一步

![image-20250528153618360](../images/image-20250528153618360-1953757e.png)

建议勾选第一个重加载CMake项目





![image-20250528153748234](../images/image-20250528153748234-f00e4170.png)

然后工具链选择STM32 也就是刚刚配置的 然后点击完成



#### 欢迎来到无代码时代！

接下来就让我们感受Clion的强大吧



##### 代码体验

![image-20250528154733992](../images/image-20250528154733992-7f60096d.png)

我只写了TOG 就能提示反转函数





![image-20250528154821727](../images/image-20250528154821727-86d4a88e.png)

回车之后 我只写了L 就自动补全了代码





![image-20250528154907817](../images/image-20250528154907817-10f91e6a.png)

Tab之后 再回车 我什么都没写 就又预判了我的思路 可谓非常好用

#####添加STlink下载器



![image-20250528155048080](../images/image-20250528155048080-2340f6c3.png)

这里点击小锤子编译代码发现没问题





![image-20250528155122519](../images/image-20250528155122519-867f6002.png)

但运行代码就会报错 是因为Clion是默认在电脑上运行的 而我们编译出的.elf文件是给单片机用的



我们可以用Clion对STLINK的支持进行操作



我们在文件-设置-高级设置中找到调试器设置 并勾选启用调试服务器

![image-20250528155509259](../images/image-20250528155509259-b9f6a3c3.png)

应用并点击确定



![image-20250528155554896](../images/image-20250528155554896-829c4da8.png)

在上面一栏中的原生里选择编辑调试服务器



![image-20250528155642059](../images/image-20250528155642059-5c438234.png)

点击+选择新增STlink 然后无需修改 并确定

再运行就可以烧录到你的芯片里了



![image-20250528155901067](../images/image-20250528155901067-e5bc157e.png)

在服务一项里可以看到和IDE的输出信息一样的部分



如果用STlink下载后 需要手动按RESET才可以正常运行

![image-20250606234051555](../images/image-20250606234051555-ae5d5830.png)

![image-20250606233844520](../images/image-20250606233844520-19bc0f3a.png)

只需将上图中的重置设备选择上传后重置 持久会话取消勾选就可以解决**用STlink下载后 需要手动按RESET才可以正常运行**的BUG了



#####调试体验



![image-20250528160124425](../images/image-20250528160124425-2080f0e1.png)

Clion的调试功能也是非常强大

我们可以点击小虫子进行调试



![image-20250528160230089](../images/image-20250528160230089-6d809d34.png)

线程和变量页面可以通过加断点 步进步过等操作调试代码各种变量   看到变量值

![image-20250528160315756](../images/image-20250528160315756-d5f802e6.png)



在外设页面可以看到各个外设寄存器的状态

![image-20250528160644084](../images/image-20250528160644084-d5039925.png)

点击加载.svd





![image-20250528160736733](../images/image-20250528160736733-3074267c.png)

在clt中选择芯片的svd文件



![image-20250528160816163](../images/image-20250528160816163-87df0fa3.png)

再将你想看的外设寄存器勾选上



![image-20250528160901724](../images/image-20250528160901724-9b1a15b8.png)

这样我们就能根据寄存器进行调试了

另外 CLion还可以对Freertos进行专门的调试 可自行探索

## Clion+STM32开发教程2:添加文件夹与头文件 解决无法输出浮点数 并初步了解CMakeList

### 前情提要

在添加外部文件时 总会出现找不到所在文件的报错 或者在用浮点数输出在屏幕上时 无法输出的问题 我们需要通过简单配置根目录下的CMakeList文件



### 添加文件夹与引入外部文件



![image-20250606235611787](../images/image-20250606235611787-198ef685.png)

![image-20250606235730373](../images/image-20250606235730373-f52e10fb.png)

![image-20250606235746039](../images/image-20250606235746039-a6fcc1dc.png)

在添加文件夹时 可以一个一个添加 也可以像上图一样 可以一起生成



![image-20250607000006394](../images/image-20250607000006394-7add90c2.png)

![image-20250607000030130](../images/image-20250607000030130-9cbc0e45.png)

![image-20250607000052504](../images/image-20250607000052504-4af1eace.png)

![image-20250607000157122](../images/image-20250607000157122-9e84608d.png)

![image-20250607000253039](../images/image-20250607000253039-b249b363.png)

在创建完.c .h文件后 在main文件中引用时会报错 无法找到文件 



![image-20250607000351685](../images/image-20250607000351685-07062ed6.png)

打开根目录下的CMakeList文件



![image-20250607000503477](../images/image-20250607000503477-eb7bc604.png)

找到这两段代码 



![image-20250607000547194](../images/image-20250607000547194-ccc5cf5c.png)

加上这两句 意思是把你的**源文件** 和 **头文件的目录**加到这两个位置

再次编译 编译通过



### CMakeList中的代码解释

首先明确的是 CMake中的语法中 set是给某个变量赋值 ${...}是取用某个变量的值

然后再来看下面的代码

![image-20250607001007832](../images/image-20250607001007832-9eb4be8f.png)

![image-20250607001211886](../images/image-20250607001211886-f6d67c2e.png)

![image-20250607001248852](../images/image-20250607001248852-89393968.png)

![image-20250607002559757](../images/image-20250607002559757-5b6ee6f9.png)

注意这里还只是为CMAKE_PROJECT_NAME赋值

![image-20250607002624385](../images/image-20250607002624385-568fda0a.png)



此时打开目录所指的文件

![image-20250607002724272](../images/image-20250607002724272-bb7318ef.png)



在里面会发现这个文件所做的事情就是为cmake提供一些工具链 而这些工具链正是我们上一个教程给的 通过我们给他的目录 找到工具链并自动运用



回到CMakeList

![image-20250607003037516](../images/image-20250607003037516-c701c78b.png)

这个文件是为了方便CLion VScode对代码的静态解析



![image-20250607003324158](../images/image-20250607003324158-1eb6c0d8.png)

![image-20250607003426113](../images/image-20250607003426113-4a573d88.png)

可以看到在CMake端加载项目时会输出这一句



![image-20250607003552163](../images/image-20250607003552163-e504773d.png)

![image-20250607003908660](../images/image-20250607003908660-5cf52c08.png)

![image-20250607003952481](../images/image-20250607003952481-a49e9bc3.png)

遇到不开源的.a或.so的链接文件 就需要配置查找链接文件



![image-20250607004220020](../images/image-20250607004220020-fb2e14a4.png)

![image-20250607004300962](../images/image-20250607004300962-e7a9c952.png)

![image-20250607004402671](../images/image-20250607004402671-a87a182d.png)



![image-20250607004503559](../images/image-20250607004503559-ab4d2756.png)

这里的stm32cubemx在上文有 即![image-20250607004636015](../images/image-20250607004636015-6c3e030d.png)



打开目录下的文件

![image-20250607004707332](../images/image-20250607004707332-b525a8a7.png)

会发现在这里已经把Core中 Drivers中 或者其他STM32CUBEMX自动生成的代码的头文件路径和源文件引用到CMakeList中了 这就是为什么 在根目录的那个CMakeList没有引用 因为在这里已经引用过了



需要注意的是 stm32cubemx下的CMakeList文件在配置CUBEMX后会变化 所以不要修改这两个文件 如果要添加或者修改 在根目录下的CMakeList文件中修改即可

### 解决无法在sprintf中用浮点数的问题

在根目录下的CMakeList文件的最后加上

```
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -mfloat-abi=soft")
set(CMAKE_C_LINK_FLAGS "${CMAKE_C_LINK_FLAGS} -u _printf_float")
```

![image-20250607005626753](../images/image-20250607005626753-cde3abaf.png)

就可以使用浮点数了

##Clion+STM32开发教程3:Openocd+STlink/DAPlink
###前情提要

在上文中 用了Clion本身支持的STlink调试服务器 但用别的芯片 或者无线调试器的时候 就需要别的下载器比如DAPlink 那我们就不用STlink调试服务器 而用Openocd+STlink/DAPlink/...的组合

### 配置

下载openocd [Download OpenOCD](https://gnutoolchains.com/arm-eabi/openocd/)

下完并压缩

如上文 新建项目 打开cubemx 配置

![image-20250609195711607](../images/image-20250609195711607-4c1fb552.png)

复制Toolchain Folder Location中的内容 生成代码 并复制到clion端的位置



![image-20250609195816273](../images/image-20250609195816273-034aac79.png)

就是这些内容



生成后若有上回用过的STlink GDB调试服务器的 在设置-高级设置-调试器 里面把启用调试器关掉

![image-20250609200224223](../images/image-20250609200224223-1e5b04b8.png)



新建一个文件daplink的cfg文件

![image-20250609200430727](../images/image-20250609200430727-82121182.png)

![image-20250609200534806](../images/image-20250609200534806-185f02f3.png)

```
adapter driver cmsis-dap
transport select swd
set FLASH_SIZE 0x10000
source [find target/stm32f1x.cfg]
# download speed = 10MHz
adapter speed 10000
```







![image-20250609200253330](../images/image-20250609200253330-95f500c4.png)

![image-20250609200317819](../images/image-20250609200317819-febf6c42.png)

![image-20250609200733142](../images/image-20250609200733142-98932d21.png)

面板配置文件就是刚刚写的daplink.cfg文件 在你的项目的同级目录下 应用并确定



![image-20250609200943963](../images/image-20250609200943963-8a6bd524.png)

然后就可以用了 红字没关系 正常现象



用openocd+stlink亦同理 配置文件改一下就行 下面是stlink的配置文件

```
# choose st-link/j-link/dap-link etc.
#adapter driver cmsis-dap
#transport select swd
source [find interface/stlink.cfg]
transport select hla_swd
source [find target/stm32f1x.cfg]
# download speed = 10MHz
adapter speed 10000
```
##Clion+STM32开发教程4:版本控制

### 前请提要

当你做好一段正确的代码后 需要修改 但你改错了 你想找回原来的代码却无从下手 只能用记事本复制粘贴 而Clion集成的Gitee(国内代码管理网站 无需魔法)就很好的帮我们管理代码 可以方便的版本回退

### 1.注册gitee账号

###2.Clion端

![image-20250718000009522](../images/image-20250718000009522-4be5e6ac.png)

![image-20250718000030012](../images/image-20250718000030012-b3db0ee8.png)



![image-20250718000049516](../images/image-20250718000049516-49331da3.png)

确定后提示未安装Git 先下载(如果下的很慢 可以打开浏览器搜索Git下载) 下载页面一路点下一步就好了 下载完成重新启动Clion



![image-20250718000437272](../images/image-20250718000437272-a65d5cd9.png)

这个文件夹是CUBEMX自动生成的 我们用不上 可以把他忽略掉 



![image-20250718000526916](../images/image-20250718000526916-fdb3e1f8.png)

![image-20250718000558530](../images/image-20250718000558530-b6f564c8.png)



在你写完初始化后 要保存第一版代码

![image-20250718000622532](../images/image-20250718000622532-ef847f8e.png)

![image-20250718000655261](../images/image-20250718000655261-fd970324.png)

这是初始化的版本 如果你修改了代码 那就选择你想要提交的部分 并且加上注明



![image-20250718000848391](../images/image-20250718000848391-d40629a1.png)

![image-20250718001017065](../images/image-20250718001017065-1a05a715.png)

然后把你的代码上传到Gitee上



![image-20250718001132243](../images/image-20250718001132243-25ffb074.png)



修改完后即使提交代码并推送到Gitee

![image-20250718001330565](../images/image-20250718001330565-d5e2efe8.png)

![image-20250718001418017](../images/image-20250718001418017-06693ee8.png)

![image-20250718001436356](../images/image-20250718001436356-1c69b519.png)





如果你想回退原来的版本

![image-20250718001752621](../images/image-20250718001752621-77924535.png)

![image-20250718001809182](../images/image-20250718001809182-0b0866de.png)

![image-20250718001641930](../images/image-20250718001641930-79e8d21b.png)



如果你又想改回去

![image-20250718001930434](../images/image-20250718001930434-4fe6bab7.png)

![image-20250718002006574](../images/image-20250718002006574-e4c67a02.png)