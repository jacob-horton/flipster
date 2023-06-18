#[macro_export]
macro_rules! serializable {
    ($i:item) => {
        #[derive(::serde::Serialize, ::serde::Deserialize, Debug, Clone)]
        #[serde(rename_all = "camelCase")]
        $i
    };
}

#[macro_export]
macro_rules! exportable {
    ($i:item) => {
        #[derive(::serde::Serialize, ::serde::Deserialize, Debug, Clone, ::ts_rs::TS)]
        #[serde(rename_all = "camelCase")]
        #[ts(export, export_to = "../web/src/types/")]
        $i
    };
}
