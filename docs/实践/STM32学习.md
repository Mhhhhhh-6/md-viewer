# GPIO八大模式

![image-20250414182713928](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250414182713928.png)

## 推挽输出

程序写入比如HAL_GPIO_WritePin(LED_GREEN_GPIO_Port, LED_GREEN_Pin, 1) 就是通过两个数据寄存器 

  if (PinState != *GPIO_PIN_RESET*)

  {

​    GPIOx->BSRR = GPIO_Pin;

  } 就是在GPIOx下的BSRR这个寄存器里 根据PINState是0还是1 记录下GPIO_Pin这个引脚 从而控制引脚的高低电平

*比如：我要控制PA7这个引脚为1*

那我就要用HAL_GPIO_WritePin(GPIOx, GPIO_Pin, PinState)这个函数

GPIOx为GPIOA 是确定在哪个区域的BSRR 这里是A区的BSRR 那么对BSRR修改值就是**GPIOA->BSRR** 而GPIO_Pin就是在确定所修改的引脚地址 如果我要修改7 那么传进BSRR的就是0000 0000 0100 0000 每次传都是16位的传 而BSRR有32位 如果按上例所说的 GPIOA->BSRR = GPIO_Pin_7; 那只传到了低16位 低16位的BSRR被称为BSy区 s为set 只有1才会设置对应的ODRy为1 而ODR又是直接操控单片机 也就是说 用户通过程序传输一组地址 BSRR接收后再发给ODR ODR再操控单片机 控制引脚输出

那么高八位的BSRR有什么用呢？ 高八位又叫BRy R是reset 用于清除 当PinState为0时 执行以下动作

else

  {

​    GPIOx->BSRR = (uint32_t)GPIO_Pin << 16u;

  }

什么意思呢？ 也就是说 如果你要将引脚控制为低电平 那么你需要将GPIO_Pin右移16位 到高16位去 BRy是0不产生影响 1清除对应的ODRy为0

那问题来了 如果我将引脚的高低相应位都置1 会怎么样？（虽然HAL库函数不会给你这个机会）这时只有BS位会起作用

![img](https://i-blog.csdnimg.cn/direct/740564a809d64b268c2be685c06367d5.png)

通过这张图可以看到 位设置/清除寄存器就是BSRR 写入后直接将数据传给输出数据寄存器ODR 也就是说 BSRR一旦收到数据，就会发送给ODR，从而对ODR的位进行操作。BSRR发送完数据以后，就直接将内部存储的值扔掉了，本身就不保存值 所以 如果要读取值 不能读BSRR 要读ODR

那我为什么不能直接控制ODR呢？ 因为我们操作BSRR可以直接操作ODR的值从而不影响别的引脚。

为什么我们操作BSRR可以直接操作ODR呢？因为它们在物理总线层面被链接在了一起，并且操作BSRR可以直接操作ODR的位。

为什么BSRR不能读取呢？因为BSRR有了值以后直接就拿给ODR了，本身不存储值，没有读取的必要。

为什么writepin函数pinstate不直接写01而是要用reset和set？

代码可读性 有时候reset可能是1

###总结

推挽输出通过用户输入的引脚地址 经过BSRR和ODR 到两个MOS管 当ODR对应的引脚为0时N-MOS管闭合 P-MOS管打开 I/O引脚为0 反之N-MOS打开 P-MOS闭合 I/O为1 以此实现控制引脚高低电平

##开漏输出

![image-20250415113303184](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415113303184.png)

禁用P-MOS管 出1时N-MOS断开 整个I/O成高阻态 或断路 小灯不亮 若出0 N-MOS激活 I/O与VSS链接N-MOS下的VSS链接 小灯两端都是0v也不会亮

![image-20250415113428587](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415113428587.png)

但如果在I/O输入5v  出0时就会形成电流 小灯亮起（此处只举了一个低电平驱动的例子）

和推挽输出相比 开漏输出没有自己的驱动电压（因为P-MOS不工作） 但因此却更加灵活 可以任意加外加电压 但前提是 该引脚需要支持5V容忍的I/O口

## 复用推挽和开漏

![image-20250415113936049](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415113936049.png)

在用片上外设 比如串口时的输出

## 上拉输入 下拉输入与浮空输入

![image-20250415114046421](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415114046421.png)

上拉输入时 I/O引脚的电流经过分叉 上面的开关闭合 下拉就是下面的闭合 浮空就是都不闭合

继续前进会遇到TTL肖特基触发器 即施密特触发器 

![image-20250415114241067](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415114241067.png)

普通比较器进行模拟量转换时 由于只有一个参考电压 因高低电平快速变化而无法准确测得当前电平

![image-20250415114422767](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415114422767.png)

施密特触发器由于有两个参考电压 在中间部分有缓冲区 能够稳定电压

![image-20250415114528108](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415114528108.png)

最后电流流出到输入数据寄存器 等待我们使用HAL_GPIO_WritePIN()对寄存器进行 读取

## 模拟输入 

即不通过触发器 直接读取模拟电压(ADC)

## 复用功能输入

接入例如串口等片上外设

可与前三个输入同时读取触发器的输出

## 在CUBE IDE中的用法与注意事项

![image-20250424215422865](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250424215422865.png)

![image-20250424215351392](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250424215351392.png)

1.根据引脚图选出对应的引脚 选择GPIO Output 因为小灯根据我们给的高低电平而亮灭

2.System Core-GPIO-Configuration中 可以选择引脚的各种设置

![image-20250424215658917](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250424215658917.png)

以PA6为例 

GPIO output level是默认输出电平 这里选择Low 默认小灯不亮

GPIO mode是选择模式 ![image-20250424215831679](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250424215831679.png)

有推挽输出和开漏输出 开漏输出需要外接电源 推挽输出则用到单片机的VDD

这里选择Output Push Pull 直接用单片机电源供电



# 外部中断

![image-20250415170449771](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415170449771.png)

EXT0-15：

PA0 PB0 PC0共用EXT0

PA1 PB1 PC1共用EXT1

...

PA15 PB15 PC15共用EXT15

![image-20250415170827429](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415170827429.png)

事件对应的处理器 事件送达后发送给外设 由外设自行处理

![image-20250415170924443](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415170924443.png)

通过配置寄存器 选择上升沿/下降沿寄存器 选择是否需要往后输出一个高电平

![image-20250415171129122](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415171129122.png)

如果对应引脚是下降沿 并被检测 那么经过一个或门到达请求挂起寄存器

其中我们也可以通过软件中断事件寄存器 通过软件手动给一个模拟1

![image-20250415171309182](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415171309182.png)

当检测完后 对应的位会在请求挂起寄存器中置1

![image-20250415171432991](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415171432991.png)

但只有请求挂起寄存器为1还不行 需要中断屏蔽寄存器的对应位也为1 这一步在最开始的PA12设置外部中断时已经做好了

在通过与门后 到达NVIC（嵌套向量中断控制器）

掌管中断向量表

![image-20250415171706267](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415171706267.png)

注意 在NVIC中 0-4由自己的中断处理函数 而5-9 10-15都共享5-9的中断处理函数和10-15处理函数

由于NVIC始终在检测 如果处理函数结束后 中断还开启 那么就会重复执行 为了只执行一边 我们需要将请求挂起寄存器清除为0

而

HAL_GPIO_EXTI_IRQHandler(KEY1_Pin);

这句代码帮我们清除了KEY1_Pin的请求挂起寄存器

仔细看这个函数会发现

void HAL_GPIO_EXTI_IRQHandler(uint16_t GPIO_Pin)

{

  /* EXTI line interrupt detected */

  if (__HAL_GPIO_EXTI_GET_IT(GPIO_Pin) != 0x00u)

  {

​    __HAL_GPIO_EXTI_CLEAR_IT(GPIO_Pin);

​    HAL_GPIO_EXTI_Callback(GPIO_Pin);

  }

}

__HAL_GPIO_EXTI_CLEAR_IT(GPIO_Pin);这一句就是在清除寄存器的数据

中断还有优先级 分为抢占优先级和响应优先级 数字越小越优先

若两个中断同时发生：

![image-20250415172611114](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415172611114.png)

若某中断正在执行 另一中断突然发生

![image-20250415172746173](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415172746173.png)

![image-20250415172805970](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415172805970.png)

## 在CUBE IDE中的用法与注意事项

![image-20250429205926043](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250429205926043.png)

在GPIO选项中选择GPIO_EXTI12

在GPIO中有以下选项

![image-20250429210054967](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250429210054967.png)

GPIO mode中![image-20250429210132922](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250429210132922.png)

有外部中断和外部事件中断的上升下降沿触发选项

中断线路最终会输入到 NVIC 控制器中，从而会运行中断服务函数，实现中断内功能，这个是软件级的。
事件线路最后产生的脉冲信号会流向其他的外设电路，是硬件级的。

比如AD转换是一个事件（上述已有举例），但是转换结束就是一个中断事件

GPIO Pull-up/Pull-down中![image-20250429210636699](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250429210636699.png)

选择上拉下拉或者悬空 决定了默认电平

这里KEY1有上拉电阻，所以选择悬空

选择完后 要记得打开中断![image-20250429211536425](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250429211536425.png)

在优先级选择中，根据中断中是否有延时而选择优先级

如果有delay 那么必须要将system tick timer的优先级高于中断，因为当中断处理函数处理时，delay会被卡住而无法运行下去。

# 串口通信

## TTL串口

![image-20250415173622998](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415173622998.png)

通过两设备的TX与RX相连 再由一些约定的高低电平变化完成通信

TX是发送IO RX是接收IO

![image-20250415173852724](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250415173852724.png)

两个设备的GND为定义的0电势 而高低电平的定义是相对于自己设备的GND的 可能A的高电平到B就是低电平 因为需要一个操作：**共地**

只要用导线将两个设备连在一起 GND这一参考电压就一致 这是完成通信的基础

### 轮询模式

通过查询数据寄存器来实现数据的发送与接收。简单但占用 CPU 资源

HAL_UART_Transmit(&huart2, receive, 2, 100);

我们用这句代码在相关串口发送数据时 会将message一帧一帧地发送给发送数据寄存器（TDR） TDR每接受到一帧数据 就会立即发送给发送移位寄存器 发送移位寄存器将数据通过TX转换成高低电平信号 发送到32的RX中

而在此过程中 CPU需要不断查询发送数据寄存器中的数据是否已经移到了发送移位寄存器 

HAL_UART_Receive(&huart2, receive, 2, HAL_MAX_DELAY);

我们在用这句代码接受串口发送的数据时也是类似 先将接收移位寄存器中从RX收到的高低电平信号转换成01信号 再存入接收移位寄存器 再一帧一帧地发送给接收数据寄存器（RDR） CPU也会一直查询是否有数据可以读取

 在轮询时 很容易出现一直等待使程序无法继续进行 即堵塞

### 中断串口模式

在发送时 CPU将一帧数据塞入寄存器后就可以继续其他任务 当发送数据寄存器发送完一帧后 发生发送数据寄存器空中断 CPU回来再发一帧 然后又回去

`uint8_t receive[2];`

`**void** **HAL_UART_RxCpltCallback**(UART_HandleTypeDef *huart)`

`{`

​	`HAL_UART_Transmit_IT(&huart2, receive, 2);`



​	`GPIO_PinState state=*GPIO_PIN_SET*;`

​	`**if**(receive[1]=='0')`

​	`{`

​	  `state=*GPIO_PIN_RESET*;`

​	`}`

​	`**if**(receive[0]=='R')`

​	`{`

​	  `HAL_GPIO_WritePin(LED_RED_GPIO_Port, LED_RED_Pin, state);`

​	`}**else** **if**(receive[0]=='G')`

​	`{`

​	  `HAL_GPIO_WritePin(LED_GREEN_GPIO_Port, LED_GREEN_Pin, state);`

​	`}**else** **if**(receive[0]=='B')`

​	`{`

​	  `HAL_GPIO_WritePin(LED_BLUE_GPIO_Port, LED_BLUE_Pin, state);`

​	`}`

​	`HAL_UART_Receive_IT(&huart2, receive, 2);`

`}`

`**int** **main**(**void**)`

`{`

`...`

`HAL_UART_Receive_IT(&huart2, receive, 2);`

`while(1)`

`{`



`}`

`}`

思考这段代码的实现逻辑

其中 HAL_UART_RxCpltCallback()函数是接收触发中断回调函数 接收结束就会触发 

由于如果把两个串口中断都放到while循环里 因为串口中断不需要消耗时间 所以还没等我发送数据 接收函数早就接收好多次了 所以试着把接收函数放到while之前 但又有一个问题 如果放到while之前 接收函数只执行一次这时就需要我们的回调函数 这个回调函数是接收结束触发一次 所以在函数里要放发送函数 和后面的逻辑实现 别忘了 最后还要再写一次接收函数 以待下次串口收发

### DMA模式

通过DMA直接将数据进行串口收发 而回调函数也属于是DMA结束回调 和IT一样

如

HAL_UART_Receive_DMA(&huart2, receive, 2);

与IT模式相比 DMA模式释放了CPU

### 串口空闲模式

只有在串口接收从忙碌转为空闲时才会触发

在main函数中while前用

HAL_UARTEx_ReceiveToIdle_DMA(&huart2, receive, **sizeof**(receive));

最后一位参数是最大接收数据亮

表示 用串口空闲模式接收数据

但如果接收的数据量到receive的一半时 会执行一次串口空回调函数

为防止这种情况 我们加了一句

__HAL_DMA_DISABLE_IT(&hdma_usart2_rx,DMA_IT_HT);

而在回调函数

**void** **HAL_UARTEx_RxEventCallback**(UART_HandleTypeDef *huart, uint16_t Size)中 

第一个参数是对应串口 第二个参数是接收完后接收的数据量

我在上一次接收了size个数据 在调试时 我想知道我自己收到了什么东西 就应该在回调函数中发送size个数据出去 在串口调试助手端看到我的数据

然后接收的数据处理应该在两次接收函数之间 也就是直接在回调函数中执行 最后 还要在回调函数中再发送接收数据的请求

因此 回调函数应该这么写

![image-20250416154958629](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250416154958629.png)

这样 不定长数据收发就实现了

###一个串口应该的模式：DMA+空闲中断（IDLE）+环形缓冲区

- **UART 空闲中断（IDLE）**：

  当串口 RX 线上 **连续一段时间没有数据接收**，USART 外设触发 **空闲中断**。

  空闲中断的主要作用是通知数据传输完成或当前帧结束。

- **DMA 接收模式**：

  DMA（Direct Memory Access） 自动将串口接收到的数据存储到指定缓冲区。
  CPU 不再需要逐字节处理接收数据，提高效率。
  HAL_UARTEx_ReceiveToIdle_DMA：启动 DMA 接收，支持接收数据直到触发 空闲中断。

- **环形缓冲区**：

  通过固定大小的缓冲区 + **读写指针** 实现数据的循环存储。

  用于连续接收数据，解决 DMA 数据处理问题。

  读写指针逻辑：

  **写指针**：指向新接收数据的位置。

  **读指针**：指向待处理数据的位置。

###在CUBE IDE中的用法与注意事项

**打开串口2外设**：`Pinout&Configuration` -> `Connectivity` -> `USART2`，将 `Mode` 选择为 `Asynchronous`

因为串口双方都有自己的系统时钟 以一致的比特率进行通信 也叫异步通信 即Asynchronous

![image-20250502185848605](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250502185848605.png)

**使能串口中断**：在 USART2 -> Configuration -> NVIC Settings 标签卡中，勾选 USART2 global interrupt 的 Enable

这里使能串口中断是为了让串口空闲中断激活

![image-20250502185820163](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250502185820163.png)

打开DMA通道，设置先默认

mode为normal 另一个选项是circle 意思是循环传输 也就是会依次循环不断地对通道1-7循环传输

Increment Address是递增地址，选择外设地址递增还是内存地址递增，这里是从主机发送数据给外设，所以是内存地址自增

数据宽度则为字

接收时也一样，选择内存地址自增

![image-20250502185946420](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250502185946420.png

![image-20250502191550299](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250502191550299.png)

![image-20250502190242738](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250502190242738.png)

波特率tx和rx都是115200

 在main.c中 引入command.c 定义串口接收数组 实现串口接收空闲中断回调函数

信息

注意将代码写到对应的注释对中

```c
/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include "command.h"
/* USER CODE END Includes */
```



```c
/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */
uint8_t readBuffer[10];
/* USER CODE END PD */
```



```c
/* USER CODE BEGIN 0 */
void HAL_UARTEx_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size){
	if (huart == &huart2){
		Command_Write(readBuffer, Size);
		HAL_UARTEx_ReceiveToIdle_DMA(&huart2, readBuffer, sizeof(readBuffer));
	}
}
/* USER CODE END 0 */
```



3️⃣ 开启串口接收 while循环中获取命令 根据命令控制小灯

信息

`rx_data[0]` 第一个字符为小灯（0x01：红色，0x02：绿色，0x03：蓝色）

`rx_data[1]` 第二个字符为状态（0：灭，1：亮）

```c
/* USER CODE BEGIN 2 */
HAL_UARTEx_ReceiveToIdle_DMA(&huart2, readBuffer, sizeof(readBuffer));
uint8_t command[50];
int commandLength = 0;
/* USER CODE END 2 */

/* Infinite loop */
/* USER CODE BEGIN WHILE */
while (1)
{
    commandLength = Command_GetCommand(command);
    if (commandLength != 0){
        HAL_UART_Transmit(&huart2, command, commandLength, HAL_MAX_DELAY);
        for (int i = 2; i < commandLength - 1; i += 2){
            GPIO_PinState state = GPIO_PIN_SET;
            if (command[i + 1] == 0x00){
                state = GPIO_PIN_RESET;
            }
            if (command[i] == 0x01){
                HAL_GPIO_WritePin(RED_GPIO_Port, RED_Pin, state);
            }else if (command[i] == 0x02){
                HAL_GPIO_WritePin(GREEN_GPIO_Port, GREEN_Pin, state);
            }else if (command[i] == 0x03){
                HAL_GPIO_WritePin(BLUE_GPIO_Port, BLUE_Pin, state);
            }
        }
    }

/* USER CODE END WHILE */

/* USER CODE BEGIN 3 */
}
```

运行顺序：HAL_UARTEx_ReceiveToIdle_DMA开启，在进入while前先读完一轮，开启HAL_UARTEx_RxEventCallback函数，在函数中将读取的数据存进循环缓冲区中，然后并再次发送接收指令

### 蓝牙模块

额和串口差不多 详见串口把

# IIC通信

由三条线组成 GND共地线 SDA数据传输线 SCL同步时钟线提供同步时钟脉冲

串口是有两条数据线 可以互相通信 所以叫全双工通信

而IIC只有SDA一条数据线 所以叫半双工通信

![image-20250416171121242](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250416171121242.png)

为了避免冲突 IIC采用主从模式

也就是STM32作为主机 发送问信号 通过SDA这条线 发送到每个从机上 再由从机回答

像IIC这种支持多个设备进行通信的通信协议 称其为总线协议

![image-20250416171136295](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250416171136295.png)

每个从机都有对应的从机地址

![image-20250416171200473](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250416171200473.png)

主机通过在最开始发送从机地址 从而从机如果看到了是自己的地址 就发送应答 否则就选择性失聪

对于串口来说

![image-20250416171344737](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250416171344737.png)

双方都有自己的系统时钟 以一致的比特率进行通信 也叫异步通信 虽然能比较方便 但无法保证双方的系统时钟是精确的

![image-20250416171628330](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250416171628330.png)

对于一些小型的传感器来说并没有精确的晶振提供时钟基准

IIC选择同步通信 也就是主机发送统一的时钟信号 作为统一的时钟源 即SCL

![image-20250416171811122](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250416171811122.png)

IIC两条线因为都有上拉电阻 所以初始都应是高电平

![image-20250416171845450](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250416171845450.png)

主机发送启动信号 提前下拉SDA 所有从机准备接受命令

在主机给从机发送信号时 

![image-20250416172334774](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250416172334774.png)

主机在SCL为低电平时给SDA设置高低电平

从机在SCL从低电平转换为高电平时 读取到SDA的高低电平

读完一字节之后 数据接收放需要发送一个ACK信号确认自己已经收到数据

也就是在时钟线低电平时 由接收方 也就是从机将数据线拉低一下

在从机发送数据时和主机一样设置电平 主机和从机一样读取数据 发送完一字节后 主机发送ACK信号 如此反复直到发送完所有信号 然后主机会在时钟线处于高电平时将数据线拉高 即STOP信号 宣告通信结束

如果IIC用DMA模式时 因为DMA没有堵塞 所以如果和普通通信一样 就会因为在读取数据的时候 写入还没结束 从而导致数据错误 所以我们需要状态机编程：

# 状态机编程

所谓状态机编程 就是把一件事情分成好几个部分 每个部分赋予一个状态 比如IIC通信就可分为0:初始状态 发送测量命令 1:正在发送测量命令 2：测量命令发送完成 等待75ms后读取AHT20数据 3：读取中 4：读取完成 解析并展示数据然后恢复到初始状态 这样每轮循环只是发一个命令 而测量时也会等测量结束 也不会堵塞代码

```c
if(aht20State==0)
{
	AHT20_Measure();
	aht20State=1;
}
```

这里是发送测量命令 并转向下一个状态

但当state为1时是正在发送命令 也就是说 改变状态是在命令发送完的时候 那么我们就可以在iicTXcplx回调函数里改变状态 

**void** **HAL_I2C_MasterTxCpltCallback**(I2C_HandleTypeDef *hi2c)

{

​	**if**(hi2c==&hi2c1)

​	{

​		aht20State=2;

​	}

}就像这样 对应的2状态是

**else** **if**(aht20State==2)

​	  {

​		  HAL_Delay(75);

​		  AHT20_Get();

​		  aht20State=3;

​		}

以此 每完成一个任务 才转向下个状态 这样一来能保证每个任务都能完成 二来也能保证一次循环不会因为某个任务而堵得太久 

# 定时器

## 时钟源与时钟树

AHB：总线 连内存 DMA 处理器

HCLK：时钟线 为AHB所连的东西带去时钟信号

APB：外设与AHB的桥梁

![image-20250503145835206](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503145835206.png)

![image-20250503145926594](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503145926594.png)

![image-20250503150029656](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503150029656.png)

时钟信号来源有两个 HSI与HSE 其中 两个时钟都能够通过PLL锁相环达成倍频，以实现SYSCLK所需的72MHz

需注意 停止模式下 AHB停止运行，HCLK停止传输时钟脉冲

唤醒时用外部中断 运用FCLK提供中断采样信号（时钟信号来自预分频器）

![image-20250503150409431](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503150409431.png)

图中的To FLITFCLK是Flash编程接口的时钟 永远来自HSI

图中的USB Prescaler用于给USB功能提供时钟 来自PLL锁相环

图中的PLLCLK是时钟安全系统，在用HSE时可以勾选，在HSE故障时可以立即将时钟源切换回HSI 并产生中断 以进行紧急制动

![image-20250503150701444](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503150701444.png)

这一部分小时钟树由LSE和LSI构成，外设时RTC实时时钟和看门狗

![image-20250503150748442](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503150748442.png)

这一部分是MCO 时钟输出功能

## TIM

![image-20250503150904224](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503150904224.png)

定时器1-8被分为三类

![image-20250503151042468](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503151042468.png)

当72MHz的信号经过1的预分频器 计数器一秒能数36M次 那么就叫做2分频

当72MHz的信号经过n-1的预分频器 计数器一秒能数72M/n次 那么就叫做n分频

![image-20250503151240027](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503151240027.png)

![image-20250503151349342](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503151349342.png)

可以设置重装载，记完后从0开始，并触发中断

### 在CUBE IDE中的用法与注意事项

![image-20250503152700281](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503152700281.png)

把Internal Clock选上 意味着开启TIM4了

![image-20250503152733272](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503152733272.png)

开启TIM4的中断

![image-20250503152854298](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503152854298.png)

这里Prescaler是预分频器 做7200分频 那么就是一秒数10000次

自动重装载Counter Period是10000-1 那么就是0-9999为一次 

这样设置之后就实现了1秒中断1次

Counter Mode中Up指上升沿计数

```c
int main(void)
{

  /* USER CODE BEGIN 1 */

  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
  HAL_Init();

  /* USER CODE BEGIN Init */

  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */

  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_GPIO_Init();
  MX_DMA_Init();
  MX_USART2_UART_Init();
  MX_TIM4_Init();
  /* USER CODE BEGIN 2 */
  HAL_TIM_Base_Start(&htim4);
  int counter=0;
  char message[20];
  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
      counter=__HAL_TIM_GET_COUNTER(&htim4);
      sprintf(message,"counter:%d",counter);
      HAL_UART_Transmit_DMA(&huart2, message, strlen(message));
	  HAL_Delay(99);
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
  }
  /* USER CODE END 3 */
}
```



这里HAL_TIM_Base_Start(&htim4);是开始计数的函数

定义一个counter用来记录计时器的已计数的量

message用于拼接字符串

counter=__HAL_TIM_GET_COUNTER(&htim4);是通过这一句handle来获取tim4寄存器中的值 倾向于直接对寄存器进行操作

除了这一句句柄操作外 还有其他的句柄操作

![image-20250503154343715](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503154343715.png)

**sprintf**(message,"counter:%d",counter);用于将counter:和counter这个变量的值拼接在一起 然后再给message

HAL_UART_Transmit_DMA(&huart2, message, strlen(message));

HAL_Delay(99);

这里是将message中的东西发出来让我看到

![image-20250503154649475](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503154649475.png)

效果是这样的 每100ms发一次

此时如果我想用定时器的更新中断 也就是1s时清零的那个中断 应该改改 将HAL_TIM_Base_Start(&htim4);改为HAL_TIM_Base_Start_IT(&htim4); 就是开启了这个中断

每次中断发生都会进入**void** **HAL_TIM_PeriodElapsedCallback**(TIM_HandleTypeDef *htim)

在这个回调函数中发送传输指令 就能实现定时发送的功能了

## 外部时钟

![image-20250503160235015](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503160235015.png)

先看这张图 除了内部时钟外 信号来源还有TI1 TI2 ETR

TI1 TI2是TIM1 INPUT和TIM2 INPUT 是定时器的输入通道

![image-20250503160441923](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503160441923.png)

两个通道都有两个输出的脉冲信号TI1FP1 TI1FP2 TI2FP1 TI2FP2

这里以TI1FP1和TI2FP2为例 

这里有TI1_ED

![image-20250503160642394](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503160642394.png)

说明了TI1FP1和TI2FP2都可以选择触发模式 而TI1_ED智能选择双边沿触发

这三个脉冲信号来到了触发器前 会选择一路信号 进入从模式控制器

除了这三个外 还有一个独立的外部时钟信号ETR

![image-20250503160849517](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503160849517.png)

ETR经过这几个步骤 其中边沿检测只检测上升沿 但极性选择可改变上升沿与下降沿身份 那么极性选择和边沿检测共同作用可选择上升沿触发或者下降沿触发

![image-20250503161039548](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503161039548.png)

我们称由触发器选择的并进入从模式控制器的模式为外部时钟模式1 由ETR直接进入触发控制器的为外部时钟模式2

### 在CUBE IDE中的用法与注意事项



![image-20250503163647943](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503163647943.png)

因为要用外部输入进行计数 所以就要用到ETR 因为TIM3 4没有ETR 所以选择TIM2 并在Clock Source中选择ETR2 

![image-20250503163834736](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503163834736.png)

因为这里是计数 所以就不分频 也不另外设置重装载了 另外Clock Filter是脉冲宽度 一般都是15 通俗来讲就是消除低于15的干扰信号

 

![image-20250503163927745](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503163927745.png)

在时钟树配置上 先不急着更改HCLK的时钟 就用8MHZ

![image-20250503164008754](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503164008754.png)

如果要用定时器中断 那就要打开







```c
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "i2c.h"
#include "tim.h"
#include "gpio.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include "oled.h"
#include <stdio.h>

/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */

/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */

/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/

/* USER CODE BEGIN PV */

/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */

/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{

  /* USER CODE BEGIN 1 */

  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
  HAL_Init();

  /* USER CODE BEGIN Init */

  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */

  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_GPIO_Init();
  MX_I2C1_Init();
  MX_TIM2_Init();
  /* USER CODE BEGIN 2 */
  HAL_Delay(20);
  OLED_Init();
  HAL_TIM_Base_Start(&htim2);
  int counter=0;
  char message[20]="";
  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
	  OLED_NewFrame();
	  counter=__HAL_TIM_GET_COUNTER(&htim2);
	  sprintf(message,"counter:%d",counter);
	  OLED_PrintString(0, 0, message, &font16x16, OLED_COLOR_NORMAL);
	  OLED_ShowFrame();
	  HAL_Delay(100);
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
  }
  /* USER CODE END 3 */
}
```

以上代码实现了在oled上输出counter的值的功能 但有点小缺点 就是如果值超过了65535咋办 所以最好还是用中断吧

用中断时要改一下Counter Period为10

![image-20250503165351562](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503165351562.png)

除了外部时钟模式2 我们还可以用外部时钟模式1 

![image-20250503165500961](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503165500961.png)

将Clock从ETR2切换回Disable

Slave Mode是从模式设置 

Trigger Source是从模式前的那个触发器选择

![image-20250503165713025](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503165713025.png)

这里从模式选择External Clock Mode 1

Trigger Source可以选择触发器所接受的那几个源：ETR TI1_ED TI1FP1 TI2FP2 

## 定时器从模式

从模式有三种模式

![image-20250503182638970](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503182638970.png)

这三种模式 是控制定时器的工作状态

###复位模式：对定时器的计数状态进行复位

这种模式下

![image-20250503182814414](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503182814414.png)

由于选了复位模式 外部时钟模式1不能给定时器提供计数信号

如果单纯想计时 则用内部时钟 如果想对外部信号进行计时 则用ETR 即外部时钟模式2

![image-20250503183103804](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503183103804.png)

如果我们用TI1FP1作为从模式控制器的信号源 复位模式下就有两个地方能将定时器记0 一个是重装载寄存器 一个是外部信号的上升沿 而这两个地方都能触发定时器更新中断

### 在CUBE IDE中的用法与注意事项

![image-20250503183849825](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503183849825.png)

TIM2的Mode选择如上

Slave Mode 选择Reset Mode 复位模式 用TI1FP1作为从模式时钟信号 Internal Clock作为内部时钟信号

不修改主频保持在8MHz

![image-20250503184645262](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503184645262.png)

因此分频为8000分频 重装载设成5000 要5s一次重装载

![image-20250503184736482](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503184736482.png)

并且要记得打开中断 代码如下

```c
/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "tim.h"
#include "usart.h"
#include "gpio.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include "string.h"
#include "stdio.h"
/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */

/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */

/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/

/* USER CODE BEGIN PV */

/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */
char updateMsg[]="自动重装载";
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
	if(htim==&htim2)
	{
		HAL_UART_Transmit(&huart2, (uint8_t*)updateMsg, strlen(updateMsg), 100);
	}
}
/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{

  /* USER CODE BEGIN 1 */

  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
  HAL_Init();

  /* USER CODE BEGIN Init */

  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */

  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_GPIO_Init();
  MX_TIM2_Init();
  MX_USART2_UART_Init();
  /* USER CODE BEGIN 2 */
  HAL_TIM_Base_Start_IT(&htim2);
  int counter=0;
  char message[20]="";

  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
	  counter=__HAL_TIM_GET_COUNTER(&htim2);
	  sprintf(message,"counter:%d",counter);
	  HAL_UART_Transmit(&huart2, (uint8_t*)message, strlen(message), 100);
	  HAL_Delay(500);
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
  }
  /* USER CODE END 3 */
}
```



我如果想区分外部时钟引起的中断和重装载引起的中断 只需要看触发器中断标志位是否被置一 就可以区分二者了

```c
char updateMsg[]="自动重装载";
char triggerMsg[]="从模式触发";
void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
	if(htim==&htim2)
	{
		if(__HAL_TIM_GET_FLAG(htim,TIM_FLAG_TRIGGER)==SET)
		{
			__HAL_TIM_CLEAR_FLAG(htim,TIM_FLAG_TRIGGER);
			HAL_UART_Transmit(&huart2, (uint8_t*)triggerMsg, strlen(triggerMsg), 100);
		}else
		{
			HAL_UART_Transmit(&huart2, (uint8_t*)updateMsg, strlen(updateMsg), 100);
		}
	}
}
```



像这样 在更新中断中 判断标志位 就可以区分两种更新了 注意要手动清除标志位

###门模式：控制时钟信号的一个门

输入信号为高电平时门打开 内部时钟开始计数 

为低时关闭 暂停计数

![image-20250503192011432](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503192011432.png)

若边沿检测器改为下降沿的话 则高低电平反过来

![image-20250503192107132](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503192107132.png)

MODE改为这样 其他无需修改

代码中 由于从模式不会触发更新中断 所以需要将

if(__HAL_TIM_GET_FLAG(htim,TIM_FLAG_TRIGGER)==SET)
		{
			__HAL_TIM_CLEAR_FLAG(htim,TIM_FLAG_TRIGGER);
			HAL_UART_Transmit(&huart2, (uint8_t*)triggerMsg, strlen(triggerMsg), 100);
		}

取出来放到while循环里去处理

### 触发模式：检测到设定的边沿后 让定时器开始计数

![image-20250503193130314](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503193130314.png)

只需改为这个模式 就能实现触发模式

但这样只能触发一次

我们可以配合单脉冲模式使用

![image-20250503193626241](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250503193626241.png)

即One Pulse Mode

这样只会进行一轮脉冲 然后五秒过后停止计数 需要外部信号来触发

## 输入捕获与超声波

![image-20250504132132220](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504132132220.png)

超声波引脚如上

![image-20250504132203314](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504132203314.png)

在测量时，控制端先拉高再拉低 当读取到下降沿时 输出端拉高 并放出超声波  

当模块检测到反射回来的超声波时，模块将Echo拉低 那么高电平的持续时间就是超声波的传输事件

![image-20250504132421626](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504132421626.png)

上图是一种解决方案

当控制端为1时 清零计数器 此时开始计数 然后当Echo的脚为0时读取计数器值

因此就需要输入捕获

![image-20250504132646240](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504132646240.png)

![image-20250504132825476](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504132825476.png)

输入捕获以内部时钟为时钟源 假设用TI1为外部时钟源 那么TI1的一个脉冲 就能让捕获寄存器捕获并读取计数器的值 TI1FP1是捕获寄存器的直接模式 TI1FP2是捕获寄存器的间接模式 

如果有一个上升沿 TI1FP1读取 并进入捕获寄存器1 让捕获寄存器1读取计数器的值

如果有一个下降沿 TI1FP2读取 并进入捕获寄存器2 让捕获寄存器2读取计数器的值

两个值一减 就是高电平的持续时长

### 在CUBE IDE中的用法与注意事项

![image-20250504133618855](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504133618855.png)

接口引脚如图

![image-20250504134715054](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504134715054.png)

把PA11选择GPIO_Output 然后改为Trig

因为PA10中由TIM1_CH3的选项 所以我们选择TIM1的通道3和通道4 来进行输入捕获

![image-20250504135004466](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504135004466.png)

便于计算 将分频设为72分频 那就是1us记1次

![image-20250504135038279](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504135038279.png)

两个通道设成这样

![image-20250504135055562](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504135055562.png)

通道3用于捕获上升沿 通道4用于捕获下降沿 一个直接一个间接

代码中：

![image-20250504141054762](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504141054762.png)

先开启tim1 再开启tim1的3通道的输入捕获 再开启tim1的4通道的输出捕获 并设为中断模式 意为当4通道输入捕获捕获到下降沿时 开启中断 通知用户已捕获 尽快处理

![image-20250504141821517](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504141821517.png)

在while循环里 将trig引脚拉高再拉低 以触发超声波 并在此时将tim1的值设为0

![image-20250504142943669](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504142943669.png).在输入捕获下降沿的中断中 读取3通道和4通道的值 并计算出distance 

## PWM

![image-20250504153019574](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504153019574.png)

![image-20250504153031698](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504153031698.png)

![image-20250504153052298](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504153052298.png)

实际上 PWM就是用数字信号尽可能模拟模拟信号

![image-20250504153233136](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504153233136.png)

那么这样 如果我们将PWM输入到小灯的正极上 不就能实现小灯的渐明渐暗了吗

在输出比较模式下 捕获寄存器变为了比较寄存器 输入的GPIO口也变为了输出GPIO脉冲信号

在此模式下 我们先在比较寄存器中写入一个值 然后和计数器进行大小比较 根据此大小关系决定输出有效电平还是无效电平

在此介绍PWM模式：

![image-20250504154008266](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504154008266.png)

两种模式如上

而正因为这里讨论的是有效电平和无效电平 是因为比较寄存器输出时会经过一个输出控制器 这个可以定义有效电平为低还是高

![image-20250504154241757](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504154241757.png)

### 在CUBE IDE中的用法与注意事项

我们要实现对小灯的PWM

![image-20250504181358336](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504181358336.png)

可以看到PB0是TIM3的通道3 那么我们就配置TIM3

![image-20250504181845363](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504181845363.png)

勾选上Internal Clock 并选择为PWM Generation CH3

![image-20250504181932840](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504181932840.png)

使72分频 并100重装载 那么比较值Pulse就是0-99

![image-20250504182046579](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504182046579.png)

来到代码 

![image-20250504183315535](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504183315535.png)

先开启三个通道的PWM模式

![image-20250504183335806](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504183335806.png)

再用__HAL_TIM_SET_COMPARE(&htim3,TIM_CHANNEL_3,i);对每个通道的PWM值进行修改 以此输出

## 编码器

![image-20250504183522453](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504183522453.png)

未旋转时都保持高电平

旋转后如图变化 输出方波信号

![image-20250504183801923](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504183801923.png)

电机还能通过单位时间内电机的旋转角度 计算得到电机的旋转速度 

![image-20250504184010395](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504184010395.png)

我们通过定时器实现对编码器的读取

### 在CUBE IDE中的用法与注意事项

![image-20250504192203437](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504192203437.png)

选择encoder mode模式

![image-20250504192733224](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504192733224.png)

选择2分频 因为一度是2 所以除以2

![image-20250504192810480](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504192810480.png)

AB相这样分 15滤波 一上一下 如果不一样就可以换一下极性

![image-20250504192906119](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504192906119.png)

代码中开启encode AB相都开了

![image-20250504193252067](C:\Users\mfs\AppData\Roaming\Typora\typora-user-images\image-20250504193252067.png)
