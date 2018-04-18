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

To access the sample application, visit the following URL from your browser:
      http://localhost:9080/retryTimeoutSample/transactions

To view the console logs in realtime as the application is retrying requests, run `tail -f <extract-directory>/target/liberty/wlp/usr/servers/retryTimeoutSampleServer/logs/console.log`

The <extract-directory>/src directory contains the BankService.java file as shown throughout this guide. 
The @Timeout and @Retry annotations that are injected into the code are located in BankService.java.

The Transactions.java file contains some configurable variables to control the outcome of the transaction history request.
If `sleepTime` is longer than the timeout period specified in @Timeout, the requests will time out. Otherwise, the request will return with the transactions or an exception, depending on the boolean `fetchSuccessful` in Transactions.java.

You can edit the Java files to change the parameter values of the @Timeout and @Retry annotations.
Changes to the Java files will automatically restart the server to take effect immediately.