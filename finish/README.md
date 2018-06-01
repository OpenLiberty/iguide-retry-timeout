# Setup

To use the sample application, download and extract the [sampleapp_retryTimeout.zip](https://github.com/OpenLiberty/iguide-retry-timeout/raw/master/finish/sampleapp_retryTimeout.zip) file to your local directory.

Use the `mvn install` Maven command from the directory that contains the extracted .zip files 
to build the project and install it in your local repository. The command creates the 
`target/liberty` directory that contains your Liberty and retryTimeoutSampleServer servers and starts 
the server.

To start the server, issue the following command from the
`<extract-directory>` directory:

    mvn liberty:run-server

This command starts the server and displays the server console.log file in the terminal window.

To stop the server, press <kbd>Ctrl</kbd> + <kbd>C</kbd> or close the terminal window.

To access the sample application, visit the http://localhost:9080/retryTimeoutSample/transactions URL.

Without any further configuration, you see a long loading sequence because the application is retrying and timing out using the Retry and Timeout policies from the guide.

You can edit the Java files to change the parameter values of the @Timeout and @Retry annotations.
Changes to the Java files automatically restart the server and take effect immediately.

# Configuration
## BankService.java
The `<extract-directory>/src` directory contains the BankService.java file that is shown throughout the guide. 
The `@Timeout` and `@Retry` annotations that are injected into the code are located in the BankService.java file.
### @Timeout Parameters
The `@Timeout` annotation accepts a long integer that specifies the timeout in milliseconds. When the request takes this amount of time without responding, a `TimeoutException` is thrown.

### @Retry Parameters
The `@Retry` annotation has many parameters to configure its usage.
* **retryOn** specifies the type of Exception to retry on.
* **maxRetries** specifies the maximum number of retries. The default is `3`.
* **maxDuration** specifies the maximum amount of time to perform retries. The default value is `180000`.
* **durationUnit** specifies the unit of time for `maxDuration`. The default is `ChronoUnit.MILLIS`.
* **delay** specifies the amount of time to wait between each retry. The default value is `0`.
* **delayUnit** specifies the unit of time for the `delay` interval. The default is `ChronoUnit.MILLIS`.
* **jitter** specifies a random variation applied to the `delay` interval. The default value is `200`.
* **jitterUnit** specifies the unit of time for `jitter`. The default is `ChronoUnit.MILLIS`.
* **abortOn** specifies the type of Exception that immediately ends the retry attempts.

## Transactions.java
The Transactions.java file contains some configurable variables to control the outcome of the transaction history request.
* **sleepTime** controls how long the request takes. If this value is greater than the value specified in `@Timeout`, the requests time out. If this value is less than the `@Timeout` value, the request goes through successfully.
* **fetchSuccessful** controls whether the request is successful or not. If `true`, the request is made. If `false`, an Exception is thrown.
