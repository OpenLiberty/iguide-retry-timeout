# Setup

To use the sample application, download and extract the [sampleapp_retryTimeout.zip](https://github.com/OpenLiberty/iguide-retry-timeout/raw/master/finish/sampleapp_retryTimeout.zip) file to your local directory.

Use the `mvn install` Maven command from the directory that contains the extracted .zip files 
to build the project and install it in your local repository. The command creates the 
`target/liberty` directory that contains your Liberty server, retryTimeoutSampleServer, and starts the server in the background.

To stop the running server, run the Maven command `mvn liberty:stop-server`. To start
the retryTimeoutSampleServer, run the Maven command `mvn liberty:start-server`.

To view the console logs in realtime as the application is retrying requests, run the following or other alternative way to view the file:

    tail -f <extract-directory>/target/liberty/wlp/usr/servers/retryTimeoutSampleServer/logs/console.log

To access the sample application, visit the http://localhost:9080/retryTimeoutSample/transactions URL.

To start simulating the transaction history request, refresh the page. The console log will update showing the number of retries and the time (ms) at which each retry occurred. The time between retry requests is equal to the timeout + delay +- jitter. 

Without any further configuration, you see a long loading sequence because the application is retrying and timing out using the Retry and Timeout policies from the guide.

You can edit the Java files to change the parameter values of the @Timeout and @Retry annotations. If the retryTimeoutSampleServer server is running, run the `mvn package` Maven command from the directory that contains the extracted .zip file to rebuild the application. The changes take effect without restarting the server. Otherwise, stop the retryTimeoutSampleServer server as indicated and run the `mvn install` Maven command which will restart the server. 

# Configuration
## BankService.java
The `<extract-directory>/src` directory contains the BankService.java file that is shown throughout the guide. 
The `@Timeout` and `@Retry` annotations that are injected into the code are located in the BankService.java file.

### @Timeout Parameters
The `@Timeout` annotation accepts a long integer that specifies the timeout in milliseconds. When the request takes this amount of time without responding, a `TimeoutException` is thrown. 

In this sample app, the `@Timeout` annotation is set with 2000 ms. This value indicates that the request will immediately end and throw a `TimeoutException` if it has not returned after running for 2000 ms.

### @Retry Parameters
The `@Retry` annotation has many parameters to configure its usage.
* **retryOn** specifies the type of Exception to retry on.
* **maxRetries** specifies the maximum number of retries. The default is `3`.
* **maxDuration** specifies the maximum amount of time to perform retries. The default value is `180000`.
* **durationUnit** specifies the unit of time for `maxDuration`. The default is `ChronoUnit.MILLIS`.
* **delay** specifies the amount of time to wait between each retry. The default value is `0`.
* **delayUnit** specifies the unit of time for the `delay` interval. The default is `ChronoUnit.MILLIS`.
* **jitter** specifies a random variation applied to the `delay` interval. The default value is `200`.
* **jitterDelayUnit** specifies the unit of time for `jitter`. The default is `ChronoUnit.MILLIS`.
* **abortOn** specifies the type of Exception that immediately ends the retry attempts.

In this sample app, the **retryOn** parameter is set to `TimeoutException.class`, telling the policy to retry the showTransactions() method when it returns with a `TimeoutException`, which comes from the `@Timeout` annotation. 	
The **maxRetries** is set to 4, allowing a maximum of 4 attempts to retry the request. The **maxDuration** is set to 10, with **durationUnit** set to `ChronoUnit.SECONDS`, which allows a total of 10 seconds for the request to retry. The retry attempts will end when either of the two conditions, **maxRetries** or **maxDuration**, is met.	
The value for **delay** is set to 200, with **delayUnit** set to `ChronoUnit.MILLIS`, indicating a delay time of 200 ms. This delay time is the wait time between the end of each request and the beginning of 	
the next retry request.	
The **jitter** value is set to 100, with **jitterDelayUnit** set to `ChronoUnit.MILLIS`, indicating a jitter of 100 ms. The jitter indicates the variance in the delay time. With the delay of 200 ms and 	
jitter of 100 ms, we can expect delays of 200 +/- 100 ms, resulting in delays between 100 ms to 300 ms.	
The **abortOn** parameter is set to `FileNotException.class`, indicating that the Retry policy will end immediately if the request throws a `FileNotFoundException`.

## Transactions.java
The Transactions.java file contains some configurable variables to control the outcome of the transaction history request.
* **sleepTime** controls how long the request takes. If this value is greater than the value specified in `@Timeout`, the requests time out and the browser displays an error message. If this value is less than the `@Timeout` value, the request goes through successfully and the browser displays the transaction history page. 
In this sample app, the value is set to 2100 ms. The request will time out and the browser displays the message "Your recent transactions are are unavailable at this time. Please try again later." 
* **abortOnCondition** controls whether the request is successful or not. If `true`, a `FileNotFoundException` is thrown and the browser instantly displays the message "Your recent transactions were unable to load." If `false`, the request is made. 
