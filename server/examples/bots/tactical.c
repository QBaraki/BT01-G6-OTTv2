#include <stdio.h>
#include <string.h>

static int is_enemy_at(const char *input, int player, int row, int col) {
    const char *piece = strstr(input, "\"pieces\":[");
    if (!piece) {
        return 0;
    }

    const char *owner_field = piece;
    while ((owner_field = strstr(owner_field, "\"owner\":")) != NULL) {
        int owner;
        int piece_row;
        int piece_col;
        const char *position = strstr(owner_field, "\"position\":{\"row\":");
        const char *next_piece = strstr(owner_field + 1, "\"owner\":");
        if (!position || (next_piece && position > next_piece) ||
            sscanf(owner_field, "\"owner\":%d", &owner) != 1 ||
            sscanf(position, "\"position\":{\"row\":%d,\"col\":%d",
                   &piece_row, &piece_col) != 2) {
            return 0;
        }
        if (owner != player && piece_row == row && piece_col == col) {
            return 1;
        }
        if (!next_piece) {
            break;
        }
        owner_field = next_piece;
    }
    return 0;
}

int main(void) {
    char input[131072];
    size_t length = fread(input, 1, sizeof(input) - 1, stdin);
    input[length] = '\0';

    char *player_field = strstr(input, "\"player\":");
    char *moves = strstr(input, "\"legalMoves\":[");
    if (!player_field || !moves) {
        return 1;
    }

    int player = 0;
    if (sscanf(player_field, "\"player\":%d", &player) != 1 ||
        (player != 1 && player != 2)) {
        return 1;
    }

    const int goal_row = player == 1 ? 8 : 0;
    const int goal_col = player == 1 ? 8 : 0;
    moves += strlen("\"legalMoves\":[");

    char best_piece[64] = "";
    int best_row = 0;
    int best_col = 0;
    int best_score = -1000000;

    char *piece_field = moves;
    while ((piece_field = strstr(piece_field, "\"pieceId\":\"")) != NULL) {
        char piece_id[64];
        int from_row;
        int from_col;
        int to_row;
        int to_col;
        char *to_field = strstr(piece_field, "\"to\":{\"row\":");
        char *from_field = strstr(piece_field, "\"from\":{\"row\":");
        if (!to_field || !from_field ||
            sscanf(piece_field, "\"pieceId\":\"%63[^\"]\"", piece_id) != 1 ||
            sscanf(from_field, "\"from\":{\"row\":%d,\"col\":%d",
                   &from_row, &from_col) != 2 ||
            sscanf(to_field, "\"to\":{\"row\":%d,\"col\":%d", &to_row,
                   &to_col) != 2) {
            return 1;
        }

        int before = (from_row > goal_row ? from_row - goal_row
                                          : goal_row - from_row) +
                     (from_col > goal_col ? from_col - goal_col
                                          : goal_col - from_col);
        int after = (to_row > goal_row ? to_row - goal_row
                                       : goal_row - to_row) +
                    (to_col > goal_col ? to_col - goal_col
                                       : goal_col - to_col);
        int capture = is_enemy_at(input, player, to_row, to_col);
        int score = (capture ? 100 : 0) + (before - after) * 10;
        if (score > best_score) {
            strcpy(best_piece, piece_id);
            best_row = to_row;
            best_col = to_col;
            best_score = score;
        }
        piece_field += strlen("\"pieceId\":\"");
    }

    if (best_piece[0] == '\0') {
        puts("null");
        return 0;
    }
    printf("{\"pieceId\":\"%s\",\"to\":{\"row\":%d,\"col\":%d}}\n",
           best_piece, best_row, best_col);
    return 0;
}
