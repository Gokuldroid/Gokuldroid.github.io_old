---
title: Android loggers analyzed
layout: post
tags: "[android,kotlin]"
categories: programming
gist: When it comes to logging there are lot of options in android. When it comes
  to multipurpose use, not every library satisfies all. We are gonna see how I settled
  with the logging library which I use for all of my android apps.
---

At first you need to do some changes in logcat console. On the right top drop select **Show only selected applications**. This will filterout only the application we are working on it.

> All the code samples are written in kotlin.  Source code is available at [Github](https://github.com/Gokuldroid/AndroidTutorials)

**Native android logging:**

Android has built in methods to do logging.

 Example,
```kotlin
 val TAG = "Demo"
private fun sampleLog() {
        Log.d(TAG, "Hello log")
}
```

![native-logger](/assets/blog/android-logger/native-logger.png){:width="100%"}

Simple! Is n't it?. It works well for small applications. As you can see in that picture there are lot of unnecessary logs. We can filterout by the Tag name (i.e, **Demo** in our case).Just type the tag name in search bar.It will show only logs with that tagname.

**Cons:**

1.You need to define tags each time or you have to write a helper boilerplate which adds tags automatically.I don't want to do this for all my applications , neither you.

2.There is no string interpolation. (It is possible in kotlin, but in java you have to do it manually).


**Timber from jake wharton [(Github link)](https://github.com/JakeWharton/timber)**

Example,

In MainApplicaiton

```kotlin
class MainApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.DEBUG) {
            Timber.plant(Timber.DebugTree())
        }else{
            Timber.plant(CrashlyticsTree())
        }
   }
    
    inner class CrashlyticsTree : Timber.Tree() {

        override fun log(priority: Int,tag: String?,message: String, t: Throwable?) {
            if (priority == Log.VERBOSE || priority == Log.DEBUG || priority == Log.INFO) {
                return
            }
            //Send to crash analytics here
        }
    } 
}
```


```kotlin
private fun sampleLogTimber(){
        Timber.d("Hello world from %s", "Gokul")
 }
```

This will produce log like this.
![native-logger](/assets/blog/android-logger/timber.png){:width="100%"}

**Pros:**

1.We can configure the logger by the build configuration easily. All we need is to give custom Timber.Tree. Crash analytics is much easier compared to android native logger.

2.No need to define tags again and again. Timber will automatically all the call site class name in log.We can define tags for one log if we want to.

3.String interpolation is possible and much better stack trace compared to native logger.

4.Rock solid base for all kind of loggers.We can extend it like the way we want or we can integrate it with any other logger easily.

**Cons :**

1.No Provision to logging to a file.(We can achieve via custom timver tree).

2.No log formatting provision.

3.Adding custom tag is painful one.

**Logger from orhanobut [(Github link)]( https://github.com/orhanobut/logger)**

It is one of the advanced logger. It supports a lot of things like formatting, exporting logs to external storage and lot of customizations are available.

Example,

```kotlin
//init logger
Logger.addLogAdapter(new AndroidLogAdapter());

Logger.d("debug");
Logger.e("error");
Logger.w("warning");
Logger.v("verbose");
Logger.i("information");
Logger.wtf("What a Terrible Failure");

//Customizations

FormatStrategy formatStrategy = PrettyFormatStrategy.newBuilder()
  .showThreadInfo(false)  // (Optional) Whether to show thread info or not. Default true
  .methodCount(0)         // (Optional) How many method line to show. Default 2
  .methodOffset(7)        // (Optional) Hides internal method calls up to offset. Default 5
  .logStrategy(customLog) // (Optional) Changes the log strategy to print out. Default LogCat
  .tag("My custom tag")   // (Optional) Global tag for every log. Default PRETTY_LOGGER
  .build();
Logger.addLogAdapter(new AndroidLogAdapter(formatStrategy));

```

This will produce output like this,

![native-logger](/assets/blog/android-logger/logger-orhannobut.png){:width="100%"}

**Pros :**

1.We can add custom tags.

2.We can jump to callsite from the console it self.

3.We can write our own format easily.

4.It provides all the things that timber has.

5.Output is nicely formatted. No need to do much work to get the sample out like given in the picture.

6.It supports external storage logging.

7.Good documentaion.


**Cons:**

1.It adds two lines extra for the dashes for every log. Once you get used to that, it will be easier.


There are plenty of loggers available in github.Certain loggers are specifically desinded for some purpose.These are general purpose loggers.

Here is some honurable mentions,

[XLog](https://github.com/promeG/XLog) - Method logger.

[Debug](https://github.com/noties/Debug) - Has better IDE support.

[Galgo](https://github.com/inaka/galgo) - On screen logger.


Let me know the loggers which you use for android in the comment section below.