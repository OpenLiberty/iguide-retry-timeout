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

import javax.enterprise.context.ApplicationScoped;

import java.io.FileNotFoundException;
import java.time.temporal.ChronoUnit;

import org.eclipse.microprofile.faulttolerance.Retry;
import org.eclipse.microprofile.faulttolerance.Timeout;
import org.eclipse.microprofile.faulttolerance.exceptions.TimeoutException;

@ApplicationScoped
public class BankService {
    @Timeout(2000) // default is 1000ms
    @Retry(
            maxRetries=4,  // default is 3
            maxDuration=10, durationUnit=ChronoUnit.SECONDS, // default 180000
            delay=200, delayUnit=ChronoUnit.MILLIS, // default 0
            jitter=200, jitterDelayUnit=ChronoUnit.MILLIS, // default 200
            retryOn={TimeoutException.class}, // CONFIRMED: 1 class works w/o brackets
            abortOn={FileNotFoundException.class})
    public Transactions showTransactions() throws Exception {
        Transactions transactions = new Transactions();
        transactions.getTransactions();
        return transactions;
    }
}