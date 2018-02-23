# -*- encoding: utf-8 -*-
import csv
import sys
import xml.etree.ElementTree as ET
import difflib


# namespace for xml from step2
NS = '{http://www.tei-c.org/ns/1.0}'


with open("../1-get_author_paper_list/nips.csv", 'r') as my_file:
    reader = csv.reader(my_file, delimiter=',')
    my_list = list(reader)

    author_set = set()
    print("author_name, author_lnk, paper_title, paper_lnk, year_of_conference, email, affiliation, location".encode('utf-8'))
    for row in my_list:
        row = map(lambda x: x.decode('utf-8'), row)
        author_lnk = row[1].encode('utf-8')
        if author_lnk in author_set:
            continue

        author_set.add(author_lnk)
        # extract author information from xmls from previous step
        try:
            author_name = row[0].encode('utf-8')
            file_name = row[3][7:].encode('utf-8')

            author_names_arr = []
            author_table = {}

            xml_path = "../2-down_papers/teis/" + file_name + ".tei.xml"
            tree = ET.parse(xml_path)
            root = tree.getroot()

            for author in root.find(NS + 'teiHeader').find(NS + 'fileDesc').find(NS + 'sourceDesc').find(NS + 'biblStruct').find(NS + 'analytic').findall(NS + 'author'):
                # some author may have multiple emails / affiliations / locations
                emails = []
                affiliations = []
                locations = []

                for email in author.findall(NS + 'email'):
                    emails.append(email.text)

                name_parts = []
                name = ''
                if author.find(NS + 'persName') is not None:
                    if author.find(NS + 'persName').find(NS + 'forename') is not None:
                        name_parts.append(author.find(NS + 'persName').find(NS + 'forename').text)
                    if author.find(NS + 'persName').find(NS + 'surname') is not None:
                        name_parts.append(author.find(NS + 'persName').find(NS + 'surname').text)
                    name = ' '.join(name_parts)

                for af in author.findall(NS + 'affiliation'):
                    for orgName in af.findall(NS + 'orgName'):
                        if orgName.get('type') == 'institution' and af.find(NS + 'orgName').text not in affiliations:
                            affiliations.append(af.find(NS + 'orgName').text)
                    for addr in af.findall(NS + 'address'):
                        region, country = '', ''
                        if addr.find(NS + 'region') is not None:
                            region = addr.find(NS + 'region').text
                        if addr.find(NS + 'country') is not None:
                            country = addr.find(NS + 'country').text
                        if len(region) > 0 and len(country) > 0:
                            locations.append('{}, {}'.format(region, country))
                        else:
                            locations.append('{}{}'.format(region, country))

                if len(name) > 0:
                    author_names_arr += [name]
                    author_table[name] = [' | '.join(emails), ' | '.join(affiliations), ' | '.join(locations)]

            if len(author_names_arr) > 0:
                if difflib.get_close_matches(author_name, author_names_arr):
                    nearest_name = difflib.get_close_matches(author_name, author_names_arr)[0]
                    info = author_table[nearest_name]
                    row += info[:]
                else:
                    row += ['', '', '']
            else:
                row += ['', '', '']
        except:
            row += ['', '', '']

        row = ['"' + x + '"' for x in row]
        row_encoded = map(lambda x: x.encode('utf-8'), row)
        print((','.encode('utf-8')).join(row_encoded))
        sys.stdout.flush()
