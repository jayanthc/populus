#!/usr/bin/python

# psrcat2js.py
# Script to create JavaScript variables for parameters in the ATNF Pulsar
# Catalogue.
# Dependency: psrcat, in the path.
# Usage: ./psrcat2js.py
#
# Created by Jayanth Chennamangalam

import numpy as np
import subprocess as sp
import json

# call psrcat to get catalogue version
# NOTE: psrcat, for reasons unknown, returns '1' on success in this case
try:
    buf = sp.check_output("psrcat -v",
                          shell=True,
                          universal_newlines=True)
except sp.CalledProcessError as e:
    version = e.output.split("\n")[1].split(" ")[-1]
    pass

# list of parameters and their data types
params = [("psrj", np.str),
          ("name", np.str),
          ("pmra", np.float),
          ("pmdec", np.float),
          ("rajd", np.float),
          ("decjd", np.float),
          ("gl", np.float),
          ("gb", np.float),
          ("pml", np.float),
          ("pmb", np.float),
          ("dm", np.float),
          ("p0", np.float),
          ("p1", np.float),
          ("s400", np.float),
          ("s1400", np.float),
          ("w50", np.float),
          ("w10", np.float),
          ("spindx", np.float),
          ("rm", np.float),
          ("tau_sc", np.float),
          ("dm1", np.float),
          ("pb", np.float),
          ("dist", np.float),
          ("dist1", np.float),
          ("age", np.float),]
# build psrcat parameter string from the above list
paramString = " ".join(i[0] for i in params)
# command for squeezing repeating spaces
translate = "tr -s ' '"
# create complete psrcat command
cmd = "psrcat -nohead -nonumber -o short -c '" + paramString + "' | "         \
      + translate
# run psrcat
buf = sp.check_output(cmd, shell=True, universal_newlines=True)
entries = buf.split("\n")
# remove the last (empty) entry
entries = entries[:-1]

p = [[] for i in range(len(params))]
for i in range(len(entries)):
    vals = entries[i].split(" ")
    for j in range(len(params)):
        if np.str == params[j][1]:
            p[j].append(vals[j])
        elif np.float == params[j][1]:
            p[j].append(float(vals[j]) if vals[j] != "*" else float("NaN"))

fileJS = open("psrcat.js", "w")
print >> fileJS, "var psrcatVersion = \"" + version + "\";"
print >> fileJS, "var nPulsars = " + str(len(entries)) + ";"
# declare the psrcat object
print >> fileJS, "var psrcat = {};"
for i in range(len(params)):
    print >> fileJS,                                                          \
             "psrcat[\"" + params[i][0] + "\"] = " + json.dumps(p[i]) + ";"
fileJS.close()

