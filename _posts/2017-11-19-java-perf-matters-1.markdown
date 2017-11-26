---
layout: post
title:  "Java : Perf matters - 1"
date:   2017-11-19 00:40:43 +0530
categories: java-performance
gist: Some people say premature optimization is the root of all evil.As a developer sometimes we are interested in pushing our limits to write the most efficient code ever written.Does indexed for loop is better than for each loop?.Does it worth our time optimizing this kind of things.Maybe these things are evil.Let's do this evil thing together. 
---
Doing microbenchmark is really hard.benchmarking code in microseconds, nanoseconds requires a lot of things to consider.**Benchmark results may vary for each computer**.Sometimes it differs in the same machine if you do it multiple times as the machine **will be at same state ever**.To keep the external noise minimum,it is advised to close all the running application so that it doesn't wait for another process to release resources.JIT compiler is playing major role optimising java code on the fly.It does some really great work but in our case, it is also a great factor to consider.For example, when you execute a function multiple times JIT optimises the code. It removes dead code (Empty methods etc, optimising bytecode, inlining functions etc). So we have to fake the JIT compiler so that it doesn't optimise our benchmarking code.In this tutorial, I am going to use JMH Gradle plugin to make tests.

>Source code of this tutorial can be found at : [PrefMatters](https://github.com/Gokuldroid/PrefMatters)

#### How to run : 
Check out code
**cd dir** and run cmd **gradlew.bat clean && gradlew.bat jmh**

We will start with well known collection arraylist.

Let's prepare a state class that we will use accross each test.

```java
public static class Constants
{
	private static final int NO_OF_VALS = 500000;
	private static final ArrayList<Integer> vals = new ArrayList<>(NO_OF_VALS);

	public Constants()
	{
		if (vals.isEmpty())
		{
			Random random = new Random();
			for (int i = 0; i < NO_OF_VALS; i++)
			{
				vals.add(i + random.nextInt(Integer.MAX_VALUE / 2));
			}
		}
	}
}
```
<br/>
### **Iterating over arraylist :**

1.using foreach

```java
public void forEachList(Constants constants, Blackhole blackhole)
{
	ArrayList<Integer> vals = constants.vals;
	for (Integer val : vals)
	{
		blackhole.consume(val);
	}
}
```
>blockhole is to consume the val. If we left the loop empty JIT will optimise the loop. That we do't need in our case


2.using indexed loop
```java
public void forEachIndexed(Constants constants, Blackhole blackhole)
{
	ArrayList<Integer> vals = constants.vals;
	for (int i = 0; i < vals.size(); i++)
	{
		blackhole.consume(vals.get(i));
	}
}
```


3.using fast indexed loop(intellij IDE says so , we will find out that soon)
```java
public void forEachFastIndexed(Constants constants, Blackhole blackhole)
{
	ArrayList<Integer> vals = constants.vals;
	for (int i = 0, size = vals.size(); i < size; i++)
	{
		blackhole.consume(vals.get(i));
	}
}
```

4.using iterator
```java
public void iterator(Constants constants, Blackhole blackhole)
{
	Iterator<Integer> itr = constants.vals.iterator();
	while (itr.hasNext())
	{
		blackhole.consume(itr.next());
	}
}
```

5.using list iterator
```java
public void listIterator(Constants constants, Blackhole blackhole)
{
	ListIterator<Integer> itr = constants.vals.listIterator();
	while (itr.hasNext())
	{
		blackhole.consume(itr.next());
	}
}
```

Benchmark results:

Throughput method (Higher is better):

|Benchmark | Mode   | Score  | Error  | Unit |
|----------|:------:|-------:|-------:|-----:|
| forEachFastIndexed| thrpt |  372.821 |± 6.424 | ops/s|
| forEachIndexed| thrpt |  409.919 |± 14.473 | ops/s|
| forEachList| thrpt |  302.609 |± 6.424 | ops/s|
| iterator| thrpt |  343.567 |± 13.681 | ops/s|
| listIterator| thrpt |  338.176 |± 12.085 | ops/s|

<br/>
Singleshot method (Lower is better): 

For 5L entries

|Benchmark | Mode   | Score  | Error  | Unit |
|----------|:------:|-------:|-------:|-----:|
| forEachFastIndexed| ss |3.907 | ± 0.692 | ms/op|
| forEachIndexed| ss |5.299 | ± 0.890 | ms/op|
| forEachList| ss |5.501 | ± 1.898 | ms/op|
| iterator| ss |5.053 | ± 1.113 | ms/op|
| listIterator| ss |6.767 | ± 1.569 | ms/op|

For 50 entries

|Benchmark | Mode   | Score  | Error  | Unit |
|----------|:------:|-------:|-------:|-----:|
| forEachFastIndexed| ss |0.013 |± 0.002 | ms/op|
| forEachIndexed| ss |0.021 |± 0.020 | ms/op|
| forEachList| ss |0.025 |± 0.002 | ms/op|
| iterator| ss |0.024 |± 0.003 | ms/op|
| listIterator| ss |0.029 |± 0.025 | ms/op|

**Conclusion :**

forEachList , iterator , listIterator yields same performance most of the time. forEach complies to iterator pattern when we compile and the working of those list internally same. indexed for loop yields better performance than iterators method.Fast index method is really means something in single invoke.Iterator implementation additionally checks for modification,makes method calls internally.In our test we used 5L objects. For smaller size result may be different.Play with this size you will get to know better.I will tend to use fast indexed loop method as my IDE does the auto-completion. This is ok for running app in PC. In android these benchmarks is really important. because we need to squeeze every cycle of CPU.


### **Adding elements to arraylist :**
1.Prepare size and add
```java
public void preparedAdd(Constants constants, Blackhole blackhole)
{
	ArrayList<Integer> vals = new ArrayList<>(Constants.NO_OF_VALS);
	for (int i = 0; i < Constants.NO_OF_VALS; i++)
	{
		vals.add(i);
	}
	blackhole.consume(vals);
}
```

2. Just add
```java
public void add(Constants constants, Blackhole blackhole)
	{
		ArrayList<Integer> vals = new ArrayList<>();
		for (int i = 0; i < Constants.NO_OF_VALS; i++)
		{
			vals.add(i);
		}
		blackhole.consume(vals);
	}
```

Benchmark results:

Throughput method (Higher is better):

|Benchmark | Mode   | Score  | Error  | Unit |
|----------|:------:|-------:|-------:|-----:|
| add| thrpt |  180.190  |± 15.306 | ops/s|
| preparedAdd| thrpt |  257.963 |± 26.253 | ops/s|

**Conclusion :**

It is clear that preparing size before adding yields better performance while adding. Initally arraylist will have default capacity of 10. When the arraylist grows internal array is grown to accommodate the data.If we know the size before inserting data it is better to create array with size make **ensureCapacity(size)** to pre-allocate size so that we can avoid unnecessary operations like creating array,copying old array to new array etc.

