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

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public class Utils {

    public static String getHTMLForTransactions() {
        String contents = new String();
        try {
            contents = getHTMLContent("transaction-history.html");
        } catch (IOException e){

        }
        return contents;
    }

	public static String getHTMLForFNFException() {
		String contents = new String();
        try {
            contents = getHTMLContent("transaction-history.html");
        } catch (IOException e){

        }
        return contents;
    }
    
    public static String getHTMLContent(String HTMLFile) throws MalformedURLException, IOException {
        URL url = new URL("http://localhost:9080/retryTimeoutSample/html/" + HTMLFile);
        BufferedReader in = new BufferedReader(new InputStreamReader(url.openStream()));

        String inputLine;
        StringBuilder response = new StringBuilder();
        String newLine = System.getProperty("line.separator");

        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine + newLine);
        }
        in.close();
        return response.toString();
    }

    public static String getHTMLBankHeader() {
        String result = 
                    "<head><link href='https://fonts.googleapis.com/css?family=Asap' rel='stylesheet'>" +
                    "      <link rel='stylesheet' href='/bulkheadSample/css/chat.css'></head>" +
                    "<body>" +
                    "   <div class='bankHeadingBlock'>" + 
                    "       <div class='bankHeading'>Global eBank</div>" +
                    "   </div>" +
                    "   <div class='chatIntro'>" +
                    "       <img class='chatIcon' src='/bulkheadSample/images/chat-icon.svg' alt='chat icon'/>" +
                    "       <span class='chatIntroText'>Chat with a financial advisor</span>" +
                    "   </div>" +
                    "   <div id='fallback'>";
        return result;
    }

}