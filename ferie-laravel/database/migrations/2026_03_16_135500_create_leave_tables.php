<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('leave_types', function (Blueprint $table) {
            $table->string('code', 20)->primary();
            $table->string('description');
            $table->boolean('deducts_balance')->default(false);
            $table->string('unit', 10)->default('days'); // days | hours
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->unsignedSmallInteger('allocated_days')->default(0);
            $table->unsignedSmallInteger('used_days')->default(0);
            $table->timestamps();
            $table->unique(['user_id', 'year']);
        });

        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('leave_type_code', 20);
            $table->date('start_date');
            $table->date('end_date');
            $table->unsignedSmallInteger('requested_units')->default(0);
            $table->string('status', 20)->default('PENDING'); // PENDING | APPROVED | REJECTED | CANCELLED
            $table->text('note_user')->nullable();
            $table->text('note_admin')->nullable();
            $table->string('approved_days')->nullable(); // giorni calcolati dopo approvazione
            $table->timestamps();

            $table->foreign('leave_type_code')->references('code')->on('leave_types');
        });

        Schema::create('company_holidays', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('description')->nullable();
            $table->timestamps();
            $table->unique('date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('leave_balances');
        Schema::dropIfExists('company_holidays');
        Schema::dropIfExists('leave_types');
    }
};
