# Setup

To use the sample application, download and extract the [sampleapp_retryTimeout.zip](https://github.com/OpenLiberty/iguide-retry-timeout/raw/master/finish/sampleapp_retryTimeout.zip) file to your local directory.

Use the `mvn install` Maven command from the directory that contains the extracted .zip files
to build the project and install it in your local repository. The command creates the
`target/liberty` directory that contains your Liberty server, retryTimeoutSampleServer, and starts the server in the background.

To stop the running server, run the Maven command `mvn liberty:stop-server`. To start
the retryTimeoutSampleServer, run the Maven command `mvn liberty:start-server`.

To access the sample application, visit the http://localhost:9080/retryTimeoutSample/transactions URL.

Without any further configuration, the application is ready to run.  You will see a long loading sequence because the application is timing out and retrying using the Timeout and Retry policies from the guide. The server's console log records the number of retries and the time (milliseconds) at which each retry occurred since the request invocation. The time between retry requests is equal to the timeout + delay &#177; jitter.

To view the console log in real time as the application is retrying requests, run the following or other alternative way to view the file:

    tail -f <extract-directory>/target/liberty/wlp/usr/servers/retryTimeoutSampleServer/logs/console.log

Refresh the browser page to run the application again.

Edit the Java files to change the parameter values of the @Timeout and @Retry annotations. If the retryTimeoutSampleServer server is running, run the `mvn package` Maven command from the directory that contains the extracted .zip files to rebuild the application. The changes take effect without restarting the server. Otherwise, stop the retryTimeoutSampleServer server as indicated and run the `mvn install` Maven command which will restart the server.

# Configuration
## BankService.java
The `<extract-directory>/src` directory contains the BankService.java file that is shown throughout the guide.
The `@Timeout` and `@Retry` annotations that are injected into the code are located in the BankService.java file.

### @Timeout Parameters
The `@Timeout` annotation accepts a long integer that specifies the timeout in milliseconds. If the request takes this amount of time without responding, a `TimeoutException` is thrown.

In this sample application, the `@Timeout` annotation is set to 2000 ms. This value indicates that the request will immediately end and throw a `TimeoutException` if it has not returned after running for 2000 ms.

### @Retry Parameters
The `@Retry` annotation has many parameters to configure its usage.
* **retryOn** specifies the exception class that triggers a retry.  The default is `java.lang.Exception.class`.
* **maxRetries** specifies the maximum number of retries. The default is `3`.
* **maxDuration** specifies the maximum amount of time to perform retries. The default value is `180000`.
* **durationUnit** specifies the unit of time for `maxDuration`. The default is `ChronoUnit.MILLIS`.
* **delay** specifies the amount of time to wait between each retry. The default value is `0`.
* **delayUnit** specifies the unit of time for the `delay` interval. The default is `ChronoUnit.MILLIS`.
* **jitter** specifies a random variation applied to the `delay` interval. The default value is `200`.
* **jitterDelayUnit** specifies the unit of time for `jitter`. The default is `ChronoUnit.MILLIS`.
* **abortOn** specifies an exception class that stops all retry attempts and fails immediately.

In this sample application, the **retryOn** parameter is set to both `TimeoutException.class` and `IOException.class`.  This setting tells the Retry policy to retry the showTransactions() method when it returns with a `TimeoutException` or any `IOException`, including subclasses of `IOException`.  The `TimeoutException` occurs because of the `@Timeout` annotation.  If the request takes longer than the time specified in the `@Timeout` annotation then a `TimeoutException` is thrown.  There is also a flag in **Transaction.java** to force a `FileNotFoundException`, a subclass of `IOException`, to be thrown.  In this way you can test how the **retryOn** and **abortOn** parameters work together to identify exceptions that cause the service to fail without exercising the Retry policy.  Remember that when a value is specified for the **retryOn** parameter, only exceptions assignable to the classes specified will engage the Retry policy.  If no value is specified then the Retry policy applies to all exceptions (default is `java.lang.Exception.class`).  If you wish to exclude an exception from this list, specify that exception in the **abortOn** parameter.

The **maxRetries** parameter is set to 4, allowing a maximum of 4 retry requests. The **maxDuration** is set to 10 and **durationUnit** is set to `ChronoUnit.SECONDS` which specifies that the total duration of all retry requests should not last more than 10 seconds. The retry attempts end when either of the two conditions, **maxRetries** or **maxDuration**, are met.

The value for **delay** is set to 200 and **delayUnit** is set to `ChronoUnit.MILLIS` indicating a delay time of 200 milliseconds. The delay time is the wait time between the end of each request and the beginning of
the next retry request.

The **jitter** value is set to 100 and **jitterDelayUnit** is set to `ChronoUnit.MILLIS` indicating a jitter of 100 milliseconds. The jitter specifies the variance in the delay time. With the delay of 200 ms and jitter of 100 ms, we can expect delays of 200 &#177; 100 ms, resulting in delays between 100 to 300 ms.

The **abortOn** parameter is set to `FileNotFoundException.class`, indicating that the Retry policy will end immediately if the request throws a `FileNotFoundException`, provided the exception is assignable to a class configured for the Retry policy.  Originally, in the sample application, the **retryOn** parameter includes `IOException.class` and `FileNotFound` is a subclass of `IOException.class`.

## Transactions.java
The Transactions.java file contains some configuration variables that control the outcome of the transaction history request for our sample application.
* **sleepTime** controls how long the request for the transaction history takes.

If this value is greater than the value specified in the `@Timeout` annotation in **BankService.java**, the request times out and the browser displays an error message. If this value is less than the `@Timeout` value, the request is successful and the browser displays the transaction history.
Initially in the sample application, the value is set to 2100 milliseconds and the `@Timeout` value is set to 2000. Therefore, the request times out and the browser displays the message "Your recent transactions are unavailable at this time. Please try again later."
* **abortOnCondition** is the sample application's way of simulating a `FileNotFoundException`. When set to `true` the service returns a `FileNotFoundException`. When `false`, the request continues and sleeps for the time specified in the **sleepTime** variable to simulate the request taking a while to complete.

Provided the `@Retry` annotation in **BankService.java** is configured to include `IOException.class` in its **retryOn** parameter, or no **retryOn** parameter is specified, the Retry policy executes when a `FileNotFoundException` is returned from the service since `FileNotFoundException` is a subclass of `IOException`.  You can see the number of retry attempts in the server's console.log (see above) and then the message "Your recent transactions were unable to load." is displayed
when either of the two conditions, **maxRetries** or **maxDuration**, are met. However, if the `@Retry` annotation also includes `abortOn{FileNotFoundException.class}`, the request immediately fails and the browser instantly displays the message "Your recent transactions were unable to load."
