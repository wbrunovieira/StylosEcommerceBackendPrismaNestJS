import { JwtAuthGuard } from "@/auth/jwt-auth.guard";
import { Roles } from "@/auth/roles.decorator";
import { RolesGuard } from "@/auth/roles.guard";
import { CreateAddressUseCase } from "@/domain/auth/application/use-cases/create-address";
import { ZodValidationsPipe } from "@/pipes/zod-validations-pipe";
import {
  Controller,
  Post,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
  HttpException,
  HttpStatus,
  ConflictException,
  Put,
} from "@nestjs/common";
import { z } from "zod";
import { Logger } from "@nestjs/common";
import { EditAddressUseCase } from "@/domain/auth/application/use-cases/edit-adress";

export const createAddressSchema = z.object({
  userId: z.string().uuid(),
  street: z.string().min(1, "Street is required"),
  number: z.number().int().positive("Number must be a positive integer"),
  complement: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "ZipCode is required"),
});

const createBodyValidationPipe = new ZodValidationsPipe(createAddressSchema);
type CreateAddressBodySchema = z.infer<typeof createAddressSchema>;

export const editAddressSchema = z.object({
  userId: z.string().uuid(),
  street: z.string().min(1, "Street is required"),
  number: z.number().int().positive("Number must be a positive integer"),
  complement: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "ZipCode is required"),
});

const editBodyValidationPipe = new ZodValidationsPipe(editAddressSchema);
type EditAddressBodySchema = z.infer<typeof editAddressSchema>;

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("users")
export class AddressController {
  private readonly logger = new Logger(AddressController.name);
  constructor(
    private readonly createAddressUseCase: CreateAddressUseCase,
    private readonly editAddressUseCase: EditAddressUseCase
  ) {}

  @Post(":userId/addresses")
  async create(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Body(createBodyValidationPipe) body: CreateAddressBodySchema
  ) {
    this.logger.log(`Received request to create address for userId: ${userId}`);
    this.logger.log(`Request body: ${JSON.stringify(body)}`);
    const result = await this.createAddressUseCase.execute({
      userId: userId,
      street: body.street,
      number: body.number,
      complement: body.complement,
      city: body.city,
      state: body.state,
      country: body.country,
      zipCode: body.zipCode,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error) {
        throw new ConflictException(error.message);
      }
      throw new ConflictException("An unexpected error occurred");
    }
    return result.value;
  }

  @Put(":userId/addresses/:addressId")
  async edit(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Param("addressId", ParseUUIDPipe) addressId: string,
    @Body(editBodyValidationPipe) body: EditAddressBodySchema
  ) {
    this.logger.log(
      `Received request to edit address for userId: ${userId} and addressId: ${addressId}`
    );
    this.logger.log(`Request body: ${JSON.stringify(body)}`);
    const result = await this.editAddressUseCase.execute({
      id: addressId,
      userId: userId,
      street: body.street,
      number: body.number,
      complement: body.complement,
      city: body.city,
      state: body.state,
      country: body.country,
      zipCode: body.zipCode,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error) {
        throw new ConflictException(error.message);
      }
      throw new ConflictException("An unexpected error occurred");
    }
    return result.value;
  }
}
