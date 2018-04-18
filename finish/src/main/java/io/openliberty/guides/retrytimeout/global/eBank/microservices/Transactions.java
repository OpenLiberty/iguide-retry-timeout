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

public class Transactions extends Service {

    public static int count = 0;
    public static long timeStart = System.currentTimeMillis();
    
    private long sleep = 2100;
    private boolean throwException = false;

    public Transactions() throws Exception {
        
    }

    public void getTransactions() throws Exception {
        System.out.println(((count == 0) ? "Trying..." : "Retrying...") + count + " at " + (System.currentTimeMillis() - timeStart) + "ms");
        count++;
        Thread.sleep(this.sleep);
        if (throwException) {
            throwException();
        }
        this.service = Utils.getHTMLForTransactions();
    }

    private void throwException() throws IOException {
        this.service = Utils.getHTMLForFNFException();
        System.out.println("Throwing FileNotFoundException");
        throw new FileNotFoundException();
    }

    public static void resetCount() {
        count = 0;
        timeStart = System.currentTimeMillis();
    }

}