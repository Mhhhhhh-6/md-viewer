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

![image-20250528142556572](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528142556572.png)

安装目录可以默认 也可以自己建个文件夹 **保证Clion CUBEMX 和CUBECLT在同一根目录下就好**





![image-20250528142801216](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528142801216.png)

这里全选 然后下一步 直接安装



###下载CUBEMX和CUBECLT

[FubeMX软件下载](https://fubemx.keysking.com/)

可以在这个软件里下载 不需要登陆ST官网 下的也挺快

或者也可以去官网自行下载

[STM32CubeMX ](https://www.st.com.cn/zh/development-tools/stm32cubemx.html)

[STM32CubeCLT ](https://www.st.com/en/development-tools/stm32cubeclt.html)



#### STM32CUBEMX下载

![image-20250528143740110](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528143740110.png)

选第二个 然后把要勾选的都勾选上 一直下一步

最后点done 下载完成



#### STM32CUBECLT下载

![image-20250528145050331](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528145050331.png)

选择ST-LINK drivers 然后等待下载完成





![image-20250528145710054](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528145710054.png)

打开对应的目录可以看到我们需要的



CMake(帮我们规划代码结构 确定代码之间的依赖关系与编译流程)

ARM-GCC(开源编译器 用于将代码编译成STM32可以运行的机器语言)

而CMake不能直接操作GCC 而是通过将需求给Ninja或者Makefile 再由他们操作GCC完成编译

![image-20250528150008161](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528150008161.png)

STM32官方选择了速度更快的Ninja方案



### 初尝Clion+STM32开发 开爽！

#### 配置Clion

打开Clion

![image-20250528150637609](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528150637609.png)

选择中文语言包-下一个-同意条款-继续



![image-20250528150736963](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528150736963.png)

自行选择





![image-20250528150753626](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528150753626.png)

选择免费非商业使用





![image-20250528150818008](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528150818008.png)

自行注册登录





![image-20250528150856915](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528150856915.png)

进去之后就是这样 看起来很舒服 至少比keil那个老古董舒服多了 也没有CUBEIDE那么冗余





点击新建项目

![image-20250528151027143](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528151027143.png)

在stm32cubemx界面里发现mx和clt都被自动识别到了 如果你之前的保存路径不在默认路径的话 可以自行编辑 选择自己的路径





#### 配置STM32CUBEMX

![image-20250528151226658](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528151226658.png)

打开后点击

ACCESS TO MCU SELECTOR





选择你的芯片 然后配置就好了 我这里选择的是STM32F103C8T6

![image-20250528151428313](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528151428313.png)

因为我用的是STLINK 所以SYS里Debug选择Serial Wire 





![image-20250528151902841](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528151902841.png)

在Project Manager里给自己的工程文件命名 然后在合理的地方选择自己代码放的位置 最重要的是将工具链Tool train选择CMake

点击生成代码 





![image-20250528152353975](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528152353975.png)

打开文件所在文件夹 复制路径



#### 继续配置Clion

![image-20250528152421650](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528152421650.png)

粘贴在你的clion的这里

然后继续并信任文件夹 





![image-20250528152709962](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528152709962.png)

然后会跳出这个框 Clion自带的MinGW固然好用 但以防万一 我们还是用CLT的Mingw



![image-20250528152805164](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528152805164.png)

选择+ 点击系统





CMake选择文件夹 打开你下载的cubeclt CMake-bin 点击cmake 然后点打开

![image-20250528153046690](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528153046690.png)

完成之后是这样





下面三个类似 

![image-20250528153253715](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528153253715.png)

最终是这样 不知道点哪个文件夹的可以看图片里的路径





而最后的调试器 当然可以替换为clt的调试器 但他没有clion自带的调试器强大 比如clt的调试器不能用python脚本调试freertos 所以调试器这里我们选择不变 点击下一步

![image-20250528153618360](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528153618360.png)

建议勾选第一个重加载CMake项目





![image-20250528153748234](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528153748234.png)

然后工具链选择STM32 也就是刚刚配置的 然后点击完成



#### 欢迎来到无代码时代！

接下来就让我们感受Clion的强大吧



##### 代码体验

![image-20250528154733992](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528154733992.png)

我只写了TOG 就能提示反转函数





![image-20250528154821727](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528154821727.png)

回车之后 我只写了L 就自动补全了代码





![image-20250528154907817](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528154907817.png)

Tab之后 再回车 我什么都没写 就又预判了我的思路 可谓非常好用

#####添加STlink下载器



![image-20250528155048080](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528155048080.png)

这里点击小锤子编译代码发现没问题





![image-20250528155122519](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528155122519.png)

但运行代码就会报错 是因为Clion是默认在电脑上运行的 而我们编译出的.elf文件是给单片机用的



我们可以用Clion对STLINK的支持进行操作



我们在文件-设置-高级设置中找到调试器设置 并勾选启用调试服务器

![image-20250528155509259](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528155509259.png)

应用并点击确定



![image-20250528155554896](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528155554896.png)

在上面一栏中的原生里选择编辑调试服务器



![image-20250528155642059](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528155642059.png)

点击+选择新增STlink 然后无需修改 并确定

再运行就可以烧录到你的芯片里了



![image-20250528155901067](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528155901067.png)

在服务一项里可以看到和IDE的输出信息一样的部分



如果用STlink下载后 需要手动按RESET才可以正常运行

![image-20250606234051555](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250606234051555.png)

![image-20250606233844520](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250606233844520.png)

只需将上图中的重置设备选择上传后重置 持久会话取消勾选就可以解决**用STlink下载后 需要手动按RESET才可以正常运行**的BUG了



#####调试体验



![image-20250528160124425](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528160124425.png)

Clion的调试功能也是非常强大

我们可以点击小虫子进行调试



![image-20250528160230089](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528160230089.png)

线程和变量页面可以通过加断点 步进步过等操作调试代码各种变量   看到变量值

![image-20250528160315756](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528160315756.png)



在外设页面可以看到各个外设寄存器的状态

![image-20250528160644084](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528160644084.png)

点击加载.svd





![image-20250528160736733](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528160736733.png)

在clt中选择芯片的svd文件



![image-20250528160816163](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528160816163.png)

再将你想看的外设寄存器勾选上



![image-20250528160901724](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250528160901724.png)

这样我们就能根据寄存器进行调试了

另外 CLion还可以对Freertos进行专门的调试 可自行探索

## Clion+STM32开发教程2:添加文件夹与头文件 解决无法输出浮点数 并初步了解CMakeList

### 前情提要

在添加外部文件时 总会出现找不到所在文件的报错 或者在用浮点数输出在屏幕上时 无法输出的问题 我们需要通过简单配置根目录下的CMakeList文件



### 添加文件夹与引入外部文件



![image-20250606235611787](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250606235611787.png)

![image-20250606235730373](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250606235730373.png)

![image-20250606235746039](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250606235746039.png)

在添加文件夹时 可以一个一个添加 也可以像上图一样 可以一起生成



![image-20250607000006394](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607000006394.png)

![image-20250607000030130](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607000030130.png)

![image-20250607000052504](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607000052504.png)

![image-20250607000157122](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607000157122.png)

![image-20250607000253039](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607000253039.png)

在创建完.c .h文件后 在main文件中引用时会报错 无法找到文件 



![image-20250607000351685](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607000351685.png)

打开根目录下的CMakeList文件



![image-20250607000503477](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607000503477.png)

找到这两段代码 



![image-20250607000547194](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607000547194.png)

加上这两句 意思是把你的**源文件** 和 **头文件的目录**加到这两个位置

再次编译 编译通过



### CMakeList中的代码解释

首先明确的是 CMake中的语法中 set是给某个变量赋值 ${...}是取用某个变量的值

然后再来看下面的代码

![image-20250607001007832](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607001007832.png)

![image-20250607001211886](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607001211886.png)

![image-20250607001248852](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607001248852.png)

![image-20250607002559757](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607002559757.png)

注意这里还只是为CMAKE_PROJECT_NAME赋值

![image-20250607002624385](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607002624385.png)



此时打开目录所指的文件

![image-20250607002724272](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607002724272.png)



在里面会发现这个文件所做的事情就是为cmake提供一些工具链 而这些工具链正是我们上一个教程给的 通过我们给他的目录 找到工具链并自动运用



回到CMakeList

![image-20250607003037516](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607003037516.png)

这个文件是为了方便CLion VScode对代码的静态解析



![image-20250607003324158](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607003324158.png)

![image-20250607003426113](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607003426113.png)

可以看到在CMake端加载项目时会输出这一句



![image-20250607003552163](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607003552163.png)

![image-20250607003908660](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607003908660.png)

![image-20250607003952481](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607003952481.png)

遇到不开源的.a或.so的链接文件 就需要配置查找链接文件



![image-20250607004220020](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607004220020.png)

![image-20250607004300962](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607004300962.png)

![image-20250607004402671](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607004402671.png)



![image-20250607004503559](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607004503559.png)

这里的stm32cubemx在上文有 即![image-20250607004636015](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607004636015.png)



打开目录下的文件

![image-20250607004707332](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607004707332.png)

会发现在这里已经把Core中 Drivers中 或者其他STM32CUBEMX自动生成的代码的头文件路径和源文件引用到CMakeList中了 这就是为什么 在根目录的那个CMakeList没有引用 因为在这里已经引用过了



需要注意的是 stm32cubemx下的CMakeList文件在配置CUBEMX后会变化 所以不要修改这两个文件 如果要添加或者修改 在根目录下的CMakeList文件中修改即可

### 解决无法在sprintf中用浮点数的问题

在根目录下的CMakeList文件的最后加上

```
set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} -mfloat-abi=soft")
set(CMAKE_C_LINK_FLAGS "${CMAKE_C_LINK_FLAGS} -u _printf_float")
```

![image-20250607005626753](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250607005626753.png)

就可以使用浮点数了

##Clion+STM32开发教程3:Openocd+STlink/DAPlink
###前情提要

在上文中 用了Clion本身支持的STlink调试服务器 但用别的芯片 或者无线调试器的时候 就需要别的下载器比如DAPlink 那我们就不用STlink调试服务器 而用Openocd+STlink/DAPlink/...的组合

### 配置

下载openocd [Download OpenOCD](https://gnutoolchains.com/arm-eabi/openocd/)

下完并压缩

如上文 新建项目 打开cubemx 配置

![image-20250609195711607](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250609195711607.png)

复制Toolchain Folder Location中的内容 生成代码 并复制到clion端的位置



![image-20250609195816273](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250609195816273.png)

就是这些内容



生成后若有上回用过的STlink GDB调试服务器的 在设置-高级设置-调试器 里面把启用调试器关掉

![image-20250609200224223](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250609200224223.png)



新建一个文件daplink的cfg文件

![image-20250609200430727](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250609200430727.png)

![image-20250609200534806](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250609200534806.png)

```
adapter driver cmsis-dap
transport select swd
set FLASH_SIZE 0x10000
source [find target/stm32f1x.cfg]
# download speed = 10MHz
adapter speed 10000
```







![image-20250609200253330](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250609200253330.png)

![image-20250609200317819](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250609200317819.png)

![image-20250609200733142](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250609200733142.png)

面板配置文件就是刚刚写的daplink.cfg文件 在你的项目的同级目录下 应用并确定



![image-20250609200943963](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250609200943963.png)

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

![image-20250718000009522](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718000009522.png)

![image-20250718000030012](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718000030012.png)



![image-20250718000049516](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718000049516.png)

确定后提示未安装Git 先下载(如果下的很慢 可以打开浏览器搜索Git下载) 下载页面一路点下一步就好了 下载完成重新启动Clion



![image-20250718000437272](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718000437272.png)

这个文件夹是CUBEMX自动生成的 我们用不上 可以把他忽略掉 



![image-20250718000526916](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718000526916.png)

![image-20250718000558530](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718000558530.png)



在你写完初始化后 要保存第一版代码

![image-20250718000622532](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718000622532.png)

![image-20250718000655261](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718000655261.png)

这是初始化的版本 如果你修改了代码 那就选择你想要提交的部分 并且加上注明



![image-20250718000848391](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718000848391.png)

![image-20250718001017065](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718001017065.png)

然后把你的代码上传到Gitee上



![image-20250718001132243](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718001132243.png)



修改完后即使提交代码并推送到Gitee

![image-20250718001330565](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718001330565.png)

![image-20250718001418017](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718001418017.png)

![image-20250718001436356](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718001436356.png)





如果你想回退原来的版本

![image-20250718001752621](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718001752621.png)

![image-20250718001809182](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718001809182.png)

![image-20250718001641930](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718001641930.png)



如果你又想改回去

![image-20250718001930434](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718001930434.png)

![image-20250718002006574](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250718002006574.png)