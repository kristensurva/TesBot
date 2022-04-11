import sys
import pandas as pd

mergedData = pd.read_pickle("D:/Desktop/Projects/bot/scripts/mergedData")

def randomQuote(name = ""):
    name = name.lower()
    content = ""
    if name!="":
        try:
            sample = mergedData.loc[mergedData['Author'].str.lower() == name].sample()
        except:
            return "No such user in this server"

    else:
        sample = mergedData.sample()
    name = sample["Author"][0]
    year = sample["Date"][0][:4]
    content = sample["Content"][0]
    attachment = sample["Attachments"][0]
    
    # Links
    if not isinstance(content, float) and content.startswith("http") and not " " in content:
        string = content + " - " + name + " " + year
    # if content is empty     and          attachment is not empty
    elif isinstance(content, float) and not isinstance(attachment, float):
        string = attachment + " - " + name + " " + year
    elif not isinstance(attachment, float):
        string = "\"" + content + "\" - " + name + " " + year + "\n" + attachment
    else:
        string = "\"" + content + "\" - " + name + " " + year
    return string

try:
    print(randomQuote(sys.argv[1]))
except:
    print("naw")