/*******************************************************************************
 * Copyright (c) 2018 IBM Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     IBM Corporation - initial API and implementation
 *******************************************************************************/
package io.openliberty.guides.retrytimeout.global.eBank.microservices;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.lang.Thread;

public class Transactions {
    /*
    Use these variables to control the execution of the sample app
        * fetchSuccessful (boolean) - true will result in transaction history page.
            false wil result in error page.
        * sleepTime (long) - sleep time in ms. if shorter than @Timeout in BankService.java,
            the request will successfully finish.
    */
    private boolean fetchSuccessful = true;
    private long sleepTime = 2100;


    public static int count = 0;
    public static long timeStart = System.currentTimeMillis();
    protected String service = "";

    public Transactions() throws Exception {
        
    }

    public void getTransactions() throws Exception {
        System.out.println(((count == 0) ? "Initial request" : "Retrying..." + count) + " at " + (System.currentTimeMillis() - timeStart) + "ms");
        count++;
        if (!fetchSuccessful) {
            throwException();
        }
        Thread.sleep(this.sleepTime);
        this.service = Utils.getHTMLForTransactions();
    }

    private void throwException() throws IOException {
        this.service = Utils.getHTMLForException();
        throw new FileNotFoundException();
    }

    public static void resetCount() {
        count = 0;
        timeStart = System.currentTimeMillis();
    }

    public String toString() {
        return this.service;
    }

}