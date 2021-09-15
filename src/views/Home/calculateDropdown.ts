export const reccomendationList : string[] = [
    "Dairy",
    "Asian",
    "Mexican",
    "Alcohol",
    "Meat",
    "Fruit",
    "Produce",
    "Vegtables",
    "Cheese",
    "Bread",
    "Cereal"
];

export default function Reccomendations(test:string) : string[] {
    return reccomendationList.filter((v, i, _) => v).slice(0,10);
}