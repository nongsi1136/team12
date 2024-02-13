-- AlterTable
ALTER TABLE `Users` MODIFY `email` VARCHAR(191) NULL,
    MODIFY `name` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL,
    MODIFY `role` ENUM('user', 'admin') NULL DEFAULT 'user';
