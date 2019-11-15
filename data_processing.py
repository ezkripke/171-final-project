import pandas as pd

df = pd.read_csv("data/incarceration_trends.csv", usecols=[
	'year', 'state', 'county_name', 'total_pop_15to64',
	'asian_pop_15to64', 'black_pop_15to64', 'latino_pop_15to64',
	'native_pop_15to64', 'other_pop_15to64', 'white_pop_15to64',
	'total_prison_pop', 'asian_prison_pop', 'black_prison_pop',
	'latino_prison_pop', 'native_prison_pop', 'other_prison_pop',
	'white_prison_pop'
])
df = df.groupby(["state", "year"]).sum()
races = ["asian", "black", "latino", "native", "other", "white"]
for r in races:
	df["pct_" + r] = df[r + "_prison_pop"] / df[r + "_pop_15to64"]
	df["pct_" + r + "_total"] = df[r + "_prison_pop"] / df["total_pop_15to64"]
df["pct_imprisoned"] = df["total_prison_pop"] / df["total_pop_15to64"]
df.to_csv("data/incarceration_trends_clean.csv")