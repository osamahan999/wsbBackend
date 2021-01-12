-- MySQL dump 10.13  Distrib 8.0.22, for Linux (x86_64)
--
-- Host: td5l74lo6615qq42.cbetxkdyhwsb.us-east-1.rds.amazonaws.com    Database: pjlgvltc2d0cp19e
-- ------------------------------------------------------
-- Server version	8.0.15

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '';

--
-- Dumping events for database 'pjlgvltc2d0cp19e'
--

--
-- Dumping routines for database 'pjlgvltc2d0cp19e'
--
/*!50003 DROP PROCEDURE IF EXISTS `get_user_by_token` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`ilqvlz9wd4ffr8rd`@`%` PROCEDURE `get_user_by_token`(token CHAR(128))
BEGIN

SELECT username, total_money, user.user_id FROM
	user_token JOIN user ON user.user_id = user_token.user_id 
    WHERE user_token.token = token;


END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `new_login_token` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`ilqvlz9wd4ffr8rd`@`%` PROCEDURE `new_login_token`(
userId INT, 
token CHAR(128)
)
BEGIN
/* Handled like transaction, if one fails, rollback all*/
DECLARE `_rollback` BOOL DEFAULT 0;
DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1;
START TRANSACTION;



INSERT INTO user_token(user_id, token, date_created) 
VALUES (userId, token, NOW());


SELECT username, total_money, user_id FROM user WHERE user_id = userId; 


/* rollback on exception*/
IF `_rollback` THEN
	ROLLBACK;
ELSE
	COMMIT;
END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `purchase_option` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`ilqvlz9wd4ffr8rd`@`%` PROCEDURE `purchase_option`(
	userId INT UNSIGNED,
    optionSymbol CHAR(19), 
    optionPrice DECIMAL(10,2),  /* can be up to 8 digits, with 2 decimal points */
    amtOfContracts INT, /* amt of options, discrete */ 
    costOfContracts DECIMAL(15,2),
    totalMoney DECIMAL(15,2)
    )
BEGIN

DECLARE optionId INT UNSIGNED;

/* Handled like transaction, if one fails, rollback all*/
DECLARE `_rollback` BOOL DEFAULT 0;
DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1;



IF ((userId IS NOT NULL) AND (totalMoney IS NOT NULL) AND (totalMoney > costOfContracts)) THEN
	START TRANSACTION;
	
    UPDATE user SET total_money = (totalMoney - costOfContracts) WHERE user_id = userId;
    
    /* if option in db, get id, else insert it*/
    /* insert the transaction*/
    
    /* insert if does not exist. else just throws a warning. column is unique*/
    INSERT IGNORE INTO contract_option (option_symbol) VALUES (optionSymbol); 
    SET optionId = (SELECT option_id FROM contract_option WHERE option_symbol = optionSymbol);
    
    INSERT INTO option_purchase (option_id, user_id, price_at_purchase, amt_of_contracts, date_purchased) 
		VALUES (optionId, userId, optionPrice, amtOfContracts, NOW());
    
    /* rollback on exception*/
	IF `_rollback` THEN
			ROLLBACK;
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error purchasing';
		ELSE
			COMMIT;
            SELECT "success: purchase";
	END IF;


ELSE 
SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error purchasing';
END IF;




END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `purchase_stock` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`ilqvlz9wd4ffr8rd`@`%` PROCEDURE `purchase_stock`(
	userId INT UNSIGNED,
    stockSymbol VARCHAR(12), /* for etfs and stuff, name can be long*/
    stockName VARCHAR(32), 
    stockCost DECIMAL(8,2),  /* can be up to 6 digits, with 2 decimal points */
    exchangeName VARCHAR(32), /* nyse, nasdaq, etc*/
    amtOfStocks INT, /* amt of stocks, discrete */ 
    costOfStocks DECIMAL(15,2),
    totalMoney DECIMAL(15,2)
    )
BEGIN

DECLARE exchangeId INT UNSIGNED;
DECLARE stockId INT UNSIGNED;

/* Handled like transaction, if one fails, rollback all*/
DECLARE `_rollback` BOOL DEFAULT 0;
DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1;




IF ((userId IS NOT NULL) AND (totalMoney IS NOT NULL) AND (totalMoney > costOfStocks)) THEN
	START TRANSACTION;
	
    UPDATE user SET total_money = (totalMoney - costOfStocks) WHERE user_id = userId;
    
    /* if exchange exists get id, else insert it*/
    /* if stock exists get id, else insert it*/
    /* insert the transaction*/
    
    /* insert if does not exist. else just throws a warning. column is unique*/
    INSERT IGNORE INTO exchange (exchange_name) VALUES (exchangeName); 
    SET exchangeId = (SELECT exchange_id FROM exchange WHERE exchange_name = exchangeName);
    
    /* stock has a constraint that makes exchange_id and stock_symbol pairs unique because 
    a stock may be on two different exchanges, but the same symbol wont be on the same exchange twice*/
	INSERT IGNORE INTO stock (exchange_id, description, stock_symbol) 
		VALUES (exchangeId, stockName, stockSymbol);
    SET stockId = (SELECT stock_id FROM stock WHERE exchange_id = exchangeId AND stock_symbol = stockSymbol);
    
    
    INSERT INTO purchase (stock_id, user_id, price_at_purchase, amt_of_purchase, date_purchased) 
		VALUES (stockId, userId, stockCost, amtOfStocks, NOW());
    
    /* rollback on exception*/
	IF `_rollback` THEN
			ROLLBACK;
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error purchasing';
		ELSE
			COMMIT;
            SELECT "success: purchase";
	END IF;


ELSE 
SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error purchasing';
END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `register` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`ilqvlz9wd4ffr8rd`@`%` PROCEDURE `register`(
username VARCHAR(45), 
password CHAR(64), 
salt CHAR(32), 
email VARCHAR(128))
BEGIN

/* Handled like transaction, if one fails, rollback all*/
DECLARE `_rollback` BOOL DEFAULT 0;
DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1;

START TRANSACTION;

	INSERT INTO user(username, hashed_password, salt, email, date_created) 
	VALUES (username, password, salt, email, NOW()); 

/* rollback on exception*/
IF `_rollback` THEN
	ROLLBACK;
ELSE
	COMMIT;
END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `register_user` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`ilqvlz9wd4ffr8rd`@`%` PROCEDURE `register_user`(
username VARCHAR(45), 
pw CHAR(64), 
salt CHAR(32), 
email VARCHAR(128))
BEGIN

	INSERT INTO user(username, hashed_password, salt, email, total_money, date_created) 
	VALUES (username, pw, salt, email, 15000 , NOW()); 



END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sell_contract` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`ilqvlz9wd4ffr8rd`@`%` PROCEDURE `sell_contract`(
userId INT,
optionPurchaseId INT,
amtToSell INT,
currentCostOfContract DECIMAL(10,2)
)
BEGIN

DECLARE amtPurchased INT UNSIGNED;
DECLARE amtSold INT UNSIGNED;
DECLARE optionId INT UNSIGNED;


/* Handled like transaction, if one fails, rollback all*/
DECLARE `_rollback` BOOL DEFAULT 0;
DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1;


/*gets the amt purchased and amt sold so far*/
SELECT amt_of_contracts, amt_sold, option_id 
	INTO amtPurchased, amtSold, optionId 
    FROM option_purchase WHERE option_purchase_id = optionPurchaseId; 
    
    
IF ((amtSold + amtToSell) <= amtPurchased) AND (currentCostOfContract != 0) THEN
	START TRANSACTION;
	
SELECT amtPurchased, amtSold, optionId;

INSERT INTO sell_option(option_purchase_id, option_id, user_id, price_at_sale, amt_sold, date_sold) 
	VALUES (optionPurchaseId, optionId, userId, currentCostOfContract, amtToSell, NOW());
    
UPDATE option_purchase SET amt_sold = amt_sold + amtToSell WHERE option_purchase_id = optionPurchaseId;

UPDATE user SET total_money = (total_money + (currentCostOfContract * amtToSell)) WHERE user_id = userId;


IF `_rollback` THEN
			ROLLBACK;
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error purchasing';
		ELSE
			COMMIT;
            SELECT "successfully sold";
	END IF;
	

    
ELSE /* You do not have enough stocks to sell the amt given*/
	SELECT "Error selling" AS Error;
    
    
    
    
END IF;


END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sell_stock` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_AUTO_VALUE_ON_ZERO' */ ;
DELIMITER ;;
CREATE DEFINER=`ilqvlz9wd4ffr8rd`@`%` PROCEDURE `sell_stock`(userId INT, 
purchaseId INT , 
amtToSell INT, 
currentCostOfStock DECIMAL(10,2))
BEGIN

DECLARE amtPurchased INT UNSIGNED;
DECLARE amtSold INT UNSIGNED;
DECLARE stockId INT UNSIGNED;

/* Handled like transaction, if one fails, rollback all*/
DECLARE `_rollback` BOOL DEFAULT 0;
DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1;

/*gets the amt purchased and amt sold so far*/
SELECT amt_of_purchase, amt_sold, stock_id 
	INTO amtPurchased, amtSold, stockId 
    FROM purchase WHERE purchase_id = purchaseId; 

IF (amtSold + amtToSell) <= amtPurchased THEN
	START TRANSACTION;
    
	UPDATE purchase SET amt_sold = (amtSold + amtToSell) WHERE purchase_id = purchaseId;
	UPDATE user SET total_money = (total_money + (amtToSell * currentCostOfStock)) WHERE user_id = userId;
    
    
    INSERT INTO stock_sell (purchase_id, stock_id, user_id, price_at_sale, amt_sold, date_sold) 
		VALUES (purchaseId, stockId, userId, currentCostOfStock, amtToSell, NOW());
    
        /* rollback on exception*/
	IF `_rollback` THEN
			ROLLBACK;
			SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error purchasing';
		ELSE
			COMMIT;
            SELECT "successfully sold";
	END IF;
	
    ELSE /* You do not have enough stocks to sell the amt given*/
	SELECT "cannot sell what you do not own";
    
END IF;

END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `set_option_expired` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`ilqvlz9wd4ffr8rd`@`%` PROCEDURE `set_option_expired`(userId INT, optionSymbol CHAR(19), optionPurchaseId INT)
BEGIN

DECLARE optionId INT UNSIGNED;
DECLARE amtOwned INT UNSIGNED;

/* Handled like transaction, if one fails, rollback all*/
DECLARE `_rollback` BOOL DEFAULT 0;
DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET `_rollback` = 1;


SELECT option_id, (amt_of_contracts - amt_sold) 
	INTO optionId, amtOwned 
	FROM option_purchase WHERE option_purchase_id = optionPurchaseId;


UPDATE option_purchase SET amt_sold = amt_of_contracts 
	WHERE user_id = userId AND option_purchase_id = optionPurchaseId;
    
INSERT INTO sell_option (option_purchase_id, option_id, user_id, price_at_sale, amt_sold, date_sold) 
	VALUES (optionPurchaseId, optionId, userId, 0, amtOwned, NOW());

/* rollback on exception*/
IF `_rollback` THEN
	ROLLBACK;
	SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error setting as expired';
ELSE
	COMMIT;
	END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2021-01-12 10:48:48
