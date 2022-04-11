import sys
import numpy as np
import pandas as pd
import dataframe_image as dfi

mergedData = pd.read_pickle("D:/Desktop/Projects/TesBot/scripts/mergedData")

def countString(text, top=15):
    text = text.lower()
    tempDf = pd.DataFrame(columns = ['Author','Count'])
    for monkey in pd.Series.unique(mergedData.Author):
        amount = mergedData.loc[mergedData["Author"] == monkey].Content.str.lower().str.count(text).sum()
        tempDf = tempDf.append({'Author':monkey, 'Count':int(amount)}, ignore_index=True)
    tempDf = tempDf[tempDf['Count']!=0]
    tempDf = tempDf.sort_values(by=['Count'], ascending=False).reset_index(drop=True)
    #tempDf.insert(0, '', range(1, 1 + len(tempDf)))
    

    tempDf = tempDf.head(top)

    def rower(data):
        s = data.index % 2 != 0
        s = pd.concat([pd.Series(s)] * data.shape[1], axis=1) #6 or the n of cols u have
        z = pd.DataFrame(np.where(s, 'background-color:#121212', ''),
                     index=data.index, columns=data.columns)
        return z

    tempDf = tempDf.style.set_properties(**{'background-color': '#222222',
                               'color': '#FFFFFF',
                               'border-color': '#FF1493'})
    tempDf = tempDf.hide_index()
    
    tempDf = tempDf.apply(rower, axis=None)
    # headers = {'props': [('background-color: #000066')]}

    
    tempDf = tempDf.set_caption("Count of \"" + text + "\"")
    # headers = {
    # 'selector': 'th:not(.index_name)',
    # 'props': 'background-color: #000066; color: white;'
    # }
    # tempDf = tempDf.set_table_styles(headers)

    styles = [dict(selector="caption", 
    props=[("text-align", "center"),
    ("font-size", "120%"),
    ("color", 'black')])] 
    tempDf = tempDf.set_table_styles(styles)
    tempDf = tempDf.set_table_styles([
    {'selector': 'thead', 'props': [('display', 'none')]}
])
    tempDf = tempDf.set_properties(**{'text-align': 'left'})
    dfi.export(tempDf,"table.png")
    return tempDf

try:
    print(countString(sys.argv[1], int(sys.argv[2])))
except:
    print("naw")



