/*
  Warnings:

  - You are about to alter the column `created_at` on the `channel_token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.
  - You are about to alter the column `expire_at` on the `channel_token` table. The data in that column could be lost. The data in that column will be cast from `DateTime(0)` to `DateTime`.

*/
-- AlterTable
ALTER TABLE `channel_token` MODIFY `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `expire_at` DATETIME NULL;

-- AlterTable
ALTER TABLE `member_in_channel` ADD COLUMN `user_role` TINYINT UNSIGNED NOT NULL DEFAULT 0;
