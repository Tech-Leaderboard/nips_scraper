const CDP = require('chrome-remote-interface');
const fs = require('fs');

const BASE_URL = 'https://papers.nips.cc';

// scrape https://papers.nips.cc/
CDP(async(client) => {
    const {Network, Page, Runtime} = client;

    try {
        await Network.enable();
        await Page.enable();
        await Network.setCacheDisabled({cacheDisabled: true});
        await Page.navigate({url: BASE_URL});
        await Page.loadEventFired();

        const step_get_urls_cnt = `document.querySelector('.main-container').getElementsByTagName("li").length`;
        const result = await Runtime.evaluate({ expression: step_get_urls_cnt });
        const urls_cnt = result.result.value;
        // console.log(`urls_cnt: ${urls_cnt}`);

        var urls = [];
        for (let i = 0; i < urls_cnt; i++) {
            const step_get_url = `document.querySelector('.main-container').getElementsByTagName("li")[${i}].getElementsByTagName("a")[0].attributes.href.value`;
            const result = await Runtime.evaluate({ expression: step_get_url });
            // console.log(`i: ${i}, consult: ${result.result.value}`);
            urls.push(result.result.value)
        }
        // console.log(`urls: ${urls}`)

        for (let i = 0; i < urls_cnt; i++) {
          const url = urls[i];
          const year = url.slice(url.length-4);
          await Page.navigate({url: `${BASE_URL}${url}`});
          await Page.loadEventFired();
          const step_get_papers_cnt = `document.querySelector('.main-container').getElementsByTagName("li").length`;
          const result = await Runtime.evaluate({ expression: step_get_urls_cnt });
          const papers_cnt = result.result.value;

          for (let j = 0; j < papers_cnt; j++) {
            const step_paper_name = `document.querySelector('.main-container').getElementsByTagName("li")[${j}].getElementsByTagName("a")[0].textContent`;
            const res1 = await Runtime.evaluate({ expression: step_paper_name });
            const paper_name = res1.result.value.replace(/"/g, '""');;

            const step_paper_url = `document.querySelector('.main-container').getElementsByTagName("li")[${j}].getElementsByTagName("a")[0].attributes.href.value`;
            const res2 = await Runtime.evaluate({ expression: step_paper_url });
            const paper_url = res2.result.value;

            const step_authors_cnt = `document.querySelector('.main-container').getElementsByTagName("li")[${j}].getElementsByClassName('author').length`;
            const res3 = await Runtime.evaluate({ expression: step_authors_cnt });
            const authors_cnt = res3.result.value;
            for (let k = 0; k < authors_cnt; k++) {
              const step_author_name = `document.querySelector('.main-container').getElementsByTagName("li")[${j}].getElementsByClassName('author')[${k}].textContent`;
              const res1 = await Runtime.evaluate({ expression: step_author_name });
              const author_name = res1.result.value;

              const step_author_url = `document.querySelector('.main-container').getElementsByTagName("li")[${j}].getElementsByClassName('author')[${k}].attributes.href.value`;
              const res2 = await Runtime.evaluate({ expression: step_author_url });
              const author_url = res2.result.value;
              console.log(`"${author_name}",${author_url},"${paper_name}",${paper_url},${year}`);
            }


          }
        }
    } catch (err) {
        console.error(err);
    } finally {
        client.close();
    }
}).on('error', (err) => {
    console.error(err);
});
