# Setup
To use the sample application, extract the sampleapp_retryTimeout.zip file to your local directory.
The application contains servlet BankServiceServlet which calls the transaction service.

Use the `mvn install` Maven command from the directory that contains the extracted .zip files 
to build the project and install it in your local repository. The command creates the 
`target/liberty` directory that contains your Liberty server, retryTimeoutSampleServer, and starts 
the server.

To start the server, issue the following command from the
`<extract-directory>` directory:

    mvn liberty:run-server

This will start the server and output the server console.log file in the terminal window.

To stop the server, hit <kbd>Ctrl</kbd> + <kbd>C</kbd> or close the terminal window.

To access the sample application, visit the following URL from your browser:
    http://localhost:9080/retryTimeoutSample/transactions

Without any configuration, you will see a long loading sequence as the app is retrying and timing out.

You can edit the Java files to change the parameter values of the @Timeout and @Retry annotations.
Changes to the Java files will automatically restart the server to take effect immediately.

# Configuration
## BankService.java
The `<extract-directory>/src` directory contains the BankService.java file as shown throughout this guide. 
The `@Timeout` and `@Retry` annotations that are injected into the code are located in BankService.java.
### @Timeout Parameters
The `@Timeout` annotation accepts a long integer that specifies the timeout in milliseconds. When the request has taken this amount of time without responding, a `TimeoutException` will be thrown.

### @Retry Parameters
The `@Retry` annotation has many parameters to configure its usage.
* **retryOn** specifies the type of Exception to retry on
* **maxRetries** specifies the max number of retries, the default is `3`
* **maxDuration** specifies the maximum amount of time to perform retries, the default value is `180000`
* **durationUnit** specifies the unit of time for `maxDuration`, the default is `ChronoUnit.MILLIS`
* **delay** specifies the amount of time to wait between each retry, the default value is `0`
* **delayUnit** specifies the unit of time for `delay`, the default is `ChronoUnit.MILLIS`
* **jitter** specifies a random variation applied to the `delay` interval, the default value is `200`
* **jitterUnit** specifies the unit of time for `jitter`, the default is `ChronoUnit.MILLIS`
* **abortOn** specifies the type of Exception that will immediately end the retry attempts

## Transactions.java
The Transactions.java file contains some configurable variables to control the outcome of the transaction history request.
* **sleepTime** controls how long the request takes. If this value is greater than the value specified in `@Timeout`, the requests will time out. If this value is less than the `@Timeout` value, the request will go through successfully.
* **fetchSuccessful** controls whether the request will be successful or not. If `true`, the request will be made. If `false`, an Exception will be thrown.
