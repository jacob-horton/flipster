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

#[macro_export]
macro_rules! enum_type {
    ($i:item) => {
        #[derive(
            sqlx::Type, Debug, Clone, ::serde::Deserialize, ::serde::Serialize, ::ts_rs::TS,
        )]
        #[ts(export, export_to = "../web/src/types/")]
        #[serde(rename_all = "camelCase")]
        #[sqlx(rename_all = "lowercase")]
        $i
    };
}
