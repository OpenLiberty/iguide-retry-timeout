To use the sample application, extract the sampleapp_retryTimeout.zip file to your local directory.
The application contains servlet BankServiceServlet which calls the transaction service.

Use the 'mvn install' Maven command from the directory that contains the extracted .zip files 
to build the project and install it in your local repository. The command creates the 
'target/liberty' directory that contains your Liberty server, retryTimeoutSampleServer, and starts 
the server.

To start and stop the server, issue the following commands from the
<extract-directory> directory:
      mvn liberty:start-server
      mvn liberty:stop-server

To view the console logs in realtime as the application is retrying requests, run 
    tail -f <extract-directory>/target/liberty/wlp/usr/servers/retryTimeoutSampleServer/logs/console.log

To access the sample application, visit the following URL from your browser:
      http://localhost:9080/retryTimeoutSample/transactions

To start simulating the transaction history request, refresh the page. The console log will update showing the number of retries and the time (ms) at which each retry occurred.

Without any configuration, you will see a long loading sequence as the app is retrying and timing out. In order to show the Retry policy in action, the app is designed to consistently timeout, fail, or successfully load based on the configuration.

The <extract-directory>/src directory contains the BankService.java file as shown throughout this guide.
The @Timeout and @Retry annotations that are injected into the code are located in BankService.java. 
In this sample app, the @Timeout annotation is set with 2000 ms. This value indicates that the request will immediately end and throw a TimeoutException if it has not returned after running for 2000 ms.

In the @Retry annotation, the retryOn parameter is set to TimeoutException.class, telling the policy to retry the showTransactions() method when it returns with a TimeoutException, which comes from the @Timeout annotation. 
The maxRetries is set to 4, allowing a maximum of 4 attempts to retry the request. The maxDuration is set to 10, with durationUnit set to ChronoUnit.SECONDS, which allows a total of 10 seconds for the request to retry. The retry attempts will end when either of the two conditions, maxRetries or maxDuration, is met.
The value for delay is set to 200, with delayUnit set to ChronoUnit.MILLIS, indicating a delay time of 200 ms. This delay time is the wait time between the end of each request and the beginning of the next retry request.
The jitter value is set to 100, with jitterDelayUnit set to ChronoUnit.MILLIS, indicating a jitter of 100 ms. The jitter indicates the variance in the delay time. With the delay of 200 ms and jitter of 100 ms, we can expect delays of 200 +/- 100 ms, resulting in delays between 100 ms to 300 ms.
The abortOn parameter is set to FileNotException.class, indicating that the Retry policy will end immediately if the request throws a FileNotFoundException.

The Transactions.java file also contains some configurable variables to control the outcome of the transaction history request, separate from the policy configurations.
If `sleepTime` is longer than the timeout period specified in @Timeout, the requests will timeout. Otherwise, the request will return with the transactions or an exception, depending on the boolean `fetchSuccessful` in Transactions.java.

You can edit the Java files to change the parameter values of the @Timeout and @Retry annotations.
Changes to the Java files will automatically restart the server to take effect immediately.