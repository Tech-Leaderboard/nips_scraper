# -*- encoding: utf-8 -*-
import csv
import pdftotext

with open("../3-merge/nips_v2.csv", 'r') as my_file:
    reader = csv.reader(my_file, delimiter=',')
    my_list = list(reader)

    for i, row in enumerate(my_list):
        row = map(lambda x: x.decode('utf-8'), row)
        if i == 0:
            row += ['pdf_header']
        else:
            try:
                file_name = row[3][7:].encode('utf-8')
                f = open("../2-down_papers/papers/" + file_name + ".pdf")
                page1 = pdftotext.PDF(f)[0]
                if len(page1) > 0:
                    i1 = page1.find('\n')
                    i2 = page1.lower().find('abstract')
                    content = page1[i1 + 1 : i2]
                    content = content.replace('"', '""')
                    row.append(content)
                else:
                    row += [""]
            except:
                row += [""]
        row = ['"' + x + '"' for x in row]
        row = [x.encode('utf-8') for x in row]
        print(','.encode('utf-8').join(row))
