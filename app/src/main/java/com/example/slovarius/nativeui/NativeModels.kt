package com.example.slovarius.nativeui

data class DictionaryEntry(
    val id: String,
    val word: String,
    val translation: String,
    val transcription: String? = null,
)

enum class AppTab {
    Dictionary,
    Favorites,
    Notes,
}

data class FavoriteEntry(
    val id: String,
    val dictionaryEntryId: String,
    val createdAtMillis: Long,
)

data class NoteEntry(
    val id: String,
    val dictionaryEntryId: String? = null,
    val text: String,
    val updatedAtMillis: Long,
)
