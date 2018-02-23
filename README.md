# Scrape nips author information


### Code Structure:
- step1: 1-get_author_paper_list: Get author name, paper title, and year of conference using headless chrome.
- step2: 2-down_papers: Download the papers, and use grobid to parse pdf header info into xml files.
- step3: 3-merge: merge the csv from step1 and xmls with affliation information from step2
- step4: 4-read_papers: merge the header text from pdf into last column for manual fix


### How to Run:

1. 1-get_author_paper_list:
   1. With node.js installed, run the commands below to start the [headless chrome server](https://developers.google.com/web/updates/2017/04/headless-chrome) first
  	```
    alias chrome="/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome"
  	chrome --headless --disable-gpu --remote-debugging-port=9222
    ```
   2. Install chrome-remote-interface
  	```
    yarn add chrome-remote-interface
    ```
   3. Run the scrape script
  	```
    node script.js > nips.csv
    ```

2. 2-down_papers:
   1. Run the commands below to install dependencies:
    ```
    yarn add csv-parse
    ```
   2. Run the scrape script to download paper:
    ```
    node script.js > nips.csv
    ```
   3. Install [grobid](https://github.com/kermitt2/grobid):
    ```
    cd ../..
    git clone https://github.com/kermitt2/grobid.git
    cd grobid
    ./gradlew clean install
    ```
   4. Run grobid to parse pdf header info into xml files:
   ```
   java -Xmx1G -jar grobid-core/build/libs/grobid-core-0.6.0-SNAPSHOT-onejar.jar -gH grobid-home \
   -dIn ../nips/2-down_papers/papers \
   -dOut ../nips/2-down_papers/teis \
   -r -exe processHeader
   ```

3. 3-merge:
   1. With papers downloaded in '../2-down_papers/papers', and header info parse in '../2-down_papers/teis' run run.py to merge the csv from step1 and xmls with affliation information from step2, and remove the duplicate authors, using the newer affiliation information:
    ```
    python run.py > nips_v2.csv
    ```

4. 4-read_papers:
   1. Install dependency:
   ```
   pip install pdftotext
   ```
   2. run:
    ```
    python runn.py > nips_v3.csv
    ```
